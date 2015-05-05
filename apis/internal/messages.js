'use strict';

var settings    = require('../../configs/settings'),
    util        = require('util'),
    Filteration = require('bookshelf-filteration');

function APIError(statusCode, errorKey, errorMessage, cause) {
  if (APIError.super_.captureStackTrace) {
    APIError.super_.captureStackTrace(this, this.constructor);
  }
  this.name = this.constructor.name;
  this.statusCode = statusCode;
  this.errorKey = errorKey;
  this.errorMessage = errorMessage;
  this.cause = cause;
  this.message = '[statusCode: ' + statusCode + ', errorKey: ' + errorKey + ', errorMessage: "' + errorMessage + '", cause: ' + cause + ']';

  this.json = function() {
    var json = {statusCode: this.statusCode, errorKey: this.errorKey, errorMessage: this.errorMessage};
    if(settings.debug === true) {
      json.cause = cause;
    }
    return json;
  };
  this.toString = function() {
    return this.message;
  };
}
util.inherits(APIError, Error);

function NotFoundError(errorKey, errorMessage, cause) {
  NotFoundError.super_.call(this, 404, errorKey, errorMessage, cause);
}
util.inherits(NotFoundError, APIError);

function getErrorKey(err) {
  if(err instanceof APIError) {
    return err.errorKey;
  } else {
    return 'unexpectedError';
  }
}

function isErrorKey(err, key) {
  return key === getErrorKey(err);
}

function isDupEntryError(err) {
  return err.code === 'ER_DUP_ENTRY';
}

function apiError(errorKey, errorMessage, cause) {
  return new APIError(400, errorKey, errorMessage, cause);
}

function unexpectedError(errorKey, errorMessage, cause) {
  return new APIError(500, errorKey, errorMessage, cause);
}

function notFoundError(errorKey, errorMessage, cause) {
  return new NotFoundError(errorKey, errorMessage, cause);
}

function validationError(prefix, err) {
  if(err instanceof Filteration.ValidationError) {
    var error = null;
    var firstError = err.errors[0];
    if(firstError.type === 'scenario.notfound' || firstError.type === 'nothingToSave') {
      error = apiError(prefix + '.' + firstError.type, firstError.messages[0], err);
    } else {
      error = apiError(prefix + '.' + firstError.attribute + '.' + firstError.type, firstError.messages[0], err);
    }
    return error;
  } else {
    return apiError(prefix + '.validationError', null, err);
  }
}

function respondWithError(err, res) {
  if(err instanceof APIError) {
    res.json(err.statusCode, err.json());
  } else {
    var internal = internalError(err.message, err);
    res.json(internal.statusCode, internal.json());
  }
}

function respondWithNotFound(res) {
  res.send(404);
}

function respondWithMovedPermanently(toView, toParams, res) {
  res.json(301, {toView: toView, toParams: toParams});
}

function respondWithRedirection(toView, toParams, res) {
  res.json(302, {toView: toView, toParams: toParams});
}

module.exports = {
  getErrorKey: getErrorKey,
  isErrorKey: isErrorKey,
  isDupEntryError: isDupEntryError,
  apiError: apiError,
  unexpectedError: unexpectedError,
  validationError: validationError,
  notFoundError: notFoundError,
  respondWithError: respondWithError,
  respondWithNotFound: respondWithNotFound,
  respondWithMovedPermanently: respondWithMovedPermanently,
  respondWithRedirection: respondWithRedirection,
  APIError: APIError,
  NotFoundError: NotFoundError
}