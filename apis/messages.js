var settings = require('../configs/settings'),
    util     = require('util');

function APIError(statusCode, errorKey, errorMessage, cause) {
  APIError.super_.call(this, errorKey);
  this.statusCode = statusCode;
  this.errorKey = errorKey;
  this.errorMessage = errorMessage;
  this.cause = cause;
  this.toJSON = function() {
    var json = {statusCode: this.statusCode, errorKey: this.errorKey, errorMessage: this.errorMessage};
    if(settings.debug === true) {
      json.cause = cause;
    }
    return json;
  };
};
util.inherits(APIError, Error);

function getErrorKey(err) {
  if(err instanceof APIError) {
    return err.errorKey;
  } else {
    return 'internalError';
  }
}

function apiError(statusCode, errorKey, errorMessage, cause) {
  return new APIError(statusCode, errorKey, errorMessage, cause);
}

function unexpectedError(errorMessage, cause) {
  return apiError(400, 'unexpectedError', errorMessage, cause);
}

function respondWithError(err, res) {
  if(err instanceof APIError) {
    res.json(err.statusCode, err.toJSON());
  } else {
    var internalError = apiError(500, 'internalError', '', err);
    res.json(internalError.statusCode, internalError.toJSON());
  }
}

function respondWithNotFound(res) {
  res.send(404);
}

function respondWithMovedPermanently(toView, toParams, res) {
  res.json(301, {toView: toView, toParams: toParams});
}

module.exports = {
  getErrorKey: getErrorKey,
  apiError: apiError,
  unexpectedError: unexpectedError,
  respondWithError: respondWithError,
  respondWithNotFound: respondWithNotFound,
  respondWithMovedPermanently: respondWithMovedPermanently,
  APIError: APIError
}