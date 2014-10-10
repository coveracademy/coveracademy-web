var util    = require('util');

var errorMapping = {
  'ER_DUP_ENTRY': AlreadyExistsError,
  'ER_NO_REFERENCED_ROW_': MissingValueError,
}

function APIError(statusCode, errorKey, errorMessage) {
  APIError.super_.call(this, errorKey);
  this.statusCode = statusCode;
  this.errorKey = errorKey;
  this.errorMessage = errorMessage;
  this.toJSON = function() {
    return {statusCode: this.statusCode, errorKey: this.errorKey, errorMessage: this.errorMessage};
  };
};
util.inherits(APIError, Error);

function NotFoundError(entity, errorMessage) {
  NotFoundError.super_.call(this, 404, entity + '.notFound', errorMessage);
};
util.inherits(NotFoundError, APIError);

function AlreadyExistsError(entity, errorMessage) {
  AlreadyExistsError.super_.call(this, 400, entity + '.alreadyExists', errorMessage);
};
util.inherits(AlreadyExistsError, APIError);

function MissingValueError(entity, errorMessage) {
  MissingValueError.super_.call(this, 400, entity + '.missingValue', errorMessage);
};
util.inherits(MissingValueError, APIError);

function ValidationError(entity, validationKey, errorMessage) {
  ValidationError.super_.call(this, 400, entity + '.validation.' + validationKey, errorMessage);
};
util.inherits(ValidationError, APIError);

function PermissionError(entity, permissionKey, errorMessage) {
  PermissionError.super_.call(this, 400, entity + '.permission.' + permissionKey, errorMessage);
}
util.inherits(PermissionError, APIError);

function fromDatabaseError(entity, err, errorMessage) {
  var errorType = errorMapping[err.clientError.cause.code];
  if(errorType) {
    return new errorType(entity);
  } else {
    return new APIError(400, 'unknown', errorMessage);
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
  fromDatabaseError: fromDatabaseError,
  formatResponse: formatResponse,
  APIError: APIError,
  NotFoundError: NotFoundError,
  AlreadyExistsError: AlreadyExistsError,
  MissingValueError: MissingValueError,
  ValidationError: ValidationError,
  PermissionError: PermissionError
}