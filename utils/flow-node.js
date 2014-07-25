var fs     = require('fs'),
    path   = require('path'),
    util   = require('util'),
    Stream = require('stream').Stream;

module.exports = flow = function(temporaryFolder) {
  var $ = this;
  $.temporaryFolder = temporaryFolder;
  $.maxFileSize = null;
  $.fileParameterName = 'file';

  try {
    fs.mkdirSync($.temporaryFolder);
  } catch(e) {
    // Ignore
  }

  var cleanIdentifier = function(identifier) {
    return identifier.replace(/^0-9A-Za-z_-/img, '');
  }

  var validateRequest = function(chunkNumber, chunkSize, totalSize, identifier, filename, fileSize) {
    // Clean up the identifier
    identifier = cleanIdentifier(identifier);

    // Check if the request is sane
    if (chunkNumber == 0 || chunkSize == 0 || totalSize == 0 || identifier.length == 0 || filename.length == 0) {
      return 'non_flow_request';
    }
    var numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize * 1.0)), 1);
    if (chunkNumber > numberOfChunks) {
      return 'invalid_flow_request1';
    }

    // Is the file too big?
    if($.maxFileSize && totalSize > $.maxFileSize) {
      return 'invalid_flow_request2';
    }

    if(typeof(fileSize) != 'undefined') {
      if(chunkNumber < numberOfChunks && fileSize != chunkSize) {
        // The chunk in the POST request isn't the correct size
        return 'invalid_flow_request3';
      }
      if(numberOfChunks > 1 && chunkNumber == numberOfChunks && fileSize != ((totalSize % chunkSize) + chunkSize)) {
        // The chunks in the POST is the last one, and the fil is not the correct size
        return 'invalid_flow_request4';
      }
      if(numberOfChunks == 1 && fileSize != totalSize) {
        // The file is only a single chunk, and the data size does not fit
        return 'invalid_flow_request5';
      }
    }

    return 'valid';
  }

  $.getChunkFilePath = function(chunkNumber, identifier) {
    // Clean up the identifier
    identifier = cleanIdentifier(identifier);
    // What would the file name be?
    return path.join($.temporaryFolder, './flow-' + identifier + '.' + chunkNumber);
  }

  $.getFinalFilePath = function(filename) {
    return path.join($.temporaryFolder, './' + filename);
  }

  //'found', filename, originalFilename, identifier
  //'not_found', null, null, null
  $.get = function(req, callback) {
    var chunkNumber = req.param('flowChunkNumber', 0);
    var chunkSize = req.param('flowChunkSize', 0);
    var totalSize = req.param('flowTotalSize', 0);
    var identifier = req.param('flowIdentifier', '');
    var filename = req.param('flowFilename', '');

    if(validateRequest(chunkNumber, chunkSize, totalSize, identifier, filename) == 'valid') {
      var chunkFilePath = getChunkFilePath(chunkNumber, identifier);
      fs.exists(chunkFilePath, function(exists) {
        if(exists) {
          callback('found', chunkFilePath, filename, identifier);
        } else {
          callback('not_found', null, null, null);
        }
      });
    } else {
      callback('not_found', null, null, null);
    }
  }

  //'partly_done', filename, originalFilename, identifier
  //'done', filename, originalFilename, identifier
  //'invalid_flow_request', null, null, null
  //'non_flow_request', null, null, null
  $.post = function(req, callback) {

    var fields = req.body;
    var files = req.files;

    var chunkNumber = fields['flowChunkNumber'];
    var chunkSize = fields['flowChunkSize'];
    var totalSize = fields['flowTotalSize'];
    var filename = fields['flowFilename'];
    var originalFilename = fields['flowIdentifier'];
    var identifier = cleanIdentifier(fields['flowIdentifier']);

    if(!files[$.fileParameterName] || !files[$.fileParameterName].size) {
      callback('invalid_flow_request', null, null, null);
      return;
    }
    var validation = validateRequest(chunkNumber, chunkSize, totalSize, identifier, files[$.fileParameterName].size);
    if(validation == 'valid') {
      var chunkFilePath = getChunkFilePath(chunkNumber, identifier);

      // Save the chunk (TODO: OVERWRITE)
      fs.rename(files[$.fileParameterName].path, chunkFilePath, function() {
        // Do we have all the chunks?
        var currentTestChunk = 1;
        var numberOfChunks = Math.max(Math.floor(totalSize/(chunkSize * 1.0)), 1);
        var testChunkExists = function() {
          fs.exists(getChunkFilePath(currentTestChunk, identifier), function(exists) {
            if(exists) {
              currentTestChunk++;
              if(currentTestChunk > numberOfChunks) {
                var destiny = fs.createWriteStream(getFinalFilePath(filename));
                write(identifier, destiny,
                  {
                    removeChunks: true,
                    onDone: function() {
                      callback('done', filename, originalFilename, identifier);
                    }
                  }
                );
              } else {
                // Recursion
                testChunkExists();
              }
            } else {
              callback('partly_done', filename, originalFilename, identifier);
            }
          });
        }
        testChunkExists();
      });
    } else {
      callback(validation, filename, originalFilename, identifier);
    }
  }

  // Pipe chunks directly in to an existing WritableStream
  //   r.write(identifier, response);
  //   r.write(identifier, response, {end:false});
  //
  //   var stream = fs.createWriteStream(filename);
  //   r.write(identifier, stream);
  //   stream.on('data', function(data) {...});
  //   stream.on('end', function() {...});
  $.write = function(identifier, writableStream, options) {
    options = options || {};
    options.writeEnd = (typeof options['writeEnd'] == 'undefined' ? true : options['writeEnd']);
    options.removeChunks = (typeof options['removeChunks'] == 'undefined' ? false : options['removeChunks']);
    // Iterate over each chunk
    var pipeChunk = function(number) {
      var chunkFilePath = getChunkFilePath(number, identifier);
      fs.exists(chunkFilePath, function(exists) {
        if (exists) {
          // If the chunk with the current number exists,
          // then create a ReadStream from the file
          // and pipe it to the specified writableStream.
          var sourceStream = fs.createReadStream(chunkFilePath);
          sourceStream.pipe(writableStream, {
            end: false
          });
          sourceStream.on('end', function() {
            // When the chunk is fully streamed,
            // jump to the next one
            pipeChunk(number + 1);
            if(options.removeChunks && options.removeChunks === true) {
              fs.unlink(chunkFilePath, function(err) {

              });
            }
          });
        } else {
          // When all the chunks have been piped, end the stream
          if (options.writeEnd) writableStream.end();
          if (options.onDone) options.onDone();
        }
      });
    }
    pipeChunk(1);
  }

  $.clean = function(identifier, options) {
    options = options || {};
    // Iterate over each chunk
    var pipeChunkRm = function(number) {
      var chunkFilePath = getChunkFilePath(number, identifier);
      fs.exists(chunkFilePath, function(exists) {
        if (exists) {
          console.log('Exist removing ', chunkFilePath);
          fs.unlink(chunkFilePath, function(err) {
            if (options.onError) opentions.onError(err);
          });
          pipeChunkRm(number++);
        } else {
          if (options.onDone) options.onDone();
        }
      });
    }
    pipeChunkRm(1);
  }

  return $;
}