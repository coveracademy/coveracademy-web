var settings = require('../../configs/settings'),
    util     = require('util');

var errorMapping = {
  'ER_DUP_ENTRY': AlreadyExistsError,
  'ER_NO_REFERENCED_ROW_': MissingValueError,
}

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
      console.log("HAHAH");
    }
    console.log(json)
    return json;
  };
};
util.inherits(APIError, Error);

function NotFoundError(entity, errorMessage, cause) {
  NotFoundError.super_.call(this, 404, entity + '.notFound', errorMessage, cause);
};
util.inherits(NotFoundError, APIError);

function AlreadyExistsError(entity, errorMessage, cause) {
  AlreadyExistsError.super_.call(this, 400, entity + '.alreadyExists', errorMessage, cause);
};
util.inherits(AlreadyExistsError, APIError);

function MissingValueError(entity, errorMessage, cause) {
  MissingValueError.super_.call(this, 400, entity + '.missingValue', errorMessage, cause);
};
util.inherits(MissingValueError, APIError);

function ValidationError(entity, validationKey, errorMessage, cause) {
  ValidationError.super_.call(this, 400, entity + '.validation.' + validationKey, errorMessage, cause);
};
util.inherits(ValidationError, APIError);

function PermissionError(entity, permissionKey, errorMessage, cause) {
  PermissionError.super_.call(this, 400, entity + '.permission.' + permissionKey, errorMessage, cause);
}
util.inherits(PermissionError, APIError);

function unexpectedError(errorMessage, cause) {
  return new APIError(400, 'unexpectedError', errorMessage, cause);
}

function fromDatabaseError(entity, errorMessage, cause) {
  var errorType = errorMapping[err.code];
  if(errorType) {
    return new errorType(entity, errorMessage, cause);
  } else {
    return new APIError(400, 'unexpectedError', errorMessage, cause);
  }
}

function formatResponse(err, res) {
  if(err instanceof APIError) {
    res.json(err.statusCode, err.toJSON());
  } else {
    res.json(500, {statusCode: 500, errorKey: 'internalError'});
  }
}

module.exports = {
  unexpectedError: unexpectedError,
  fromDatabaseError: fromDatabaseError,
  formatResponse: formatResponse,
  APIError: APIError,
  NotFoundError: NotFoundError,
  AlreadyExistsError: AlreadyExistsError,
  MissingValueError: MissingValueError,
  ValidationError: ValidationError,
  PermissionError: PermissionError
}