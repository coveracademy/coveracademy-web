var util    = require('util');

var errorMapping = {
  'ER_DUP_ENTRY': AlreadyExistsError,
  'ER_NO_REFERENCED_ROW_': MissingValueError,
}

function GenericError(statusCode, key) {
  GenericError.super_.call(this, key);
  this.statusCode = statusCode;
  this.key = key;
  this.toJSON = function() {
    return {statusCode: this.statusCode, key: this.key};
  };
};
util.inherits(GenericError, Error);

function NotFoundError(entity) {
  NotFoundError.super_.call(this, 404, entity + ".notFound");
};
util.inherits(NotFoundError, GenericError);

function AlreadyExistsError(entity) {
  AlreadyExistsError.super_.call(this, 400, entity + ".alreadyExists");
};
util.inherits(AlreadyExistsError, GenericError);

function MissingValueError(entity) {
  MissingValueError.super_.call(this, 400, entity + ".missingValue");
};
util.inherits(MissingValueError, GenericError);

function ValidationError(entity, validationKey) {
  ValidationError.super_.call(this, 400, entity + ".validation." + validationKey);
};
util.inherits(ValidationError, GenericError);

function PermissionError(entity, permissionKey) {
  PermissionError.super_.call(this, 400, entity + ".permission." + permissionKey);
}
util.inherits(PermissionError, GenericError);

function fromDatabaseError(entity, err) {
  var errorType = errorMapping[err.clientError.cause.code];
  if(errorType) {
    return new errorType(entity);
  } else {
    return new GenericError(400, 'unknown');
  }
}

module.exports = {
  fromDatabaseError: fromDatabaseError,
  GenericError: GenericError,
  NotFoundError: NotFoundError,
  AlreadyExistsError: AlreadyExistsError,
  MissingValueError: MissingValueError,
  ValidationError: ValidationError,
  PermissionError: PermissionError
}