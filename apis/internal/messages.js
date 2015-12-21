'use strict';

var settings        = require('../../configs/settings'),
    util            = require('util'),
    ValidationError = require('bookshelf-filteration').ValidationError;

function APIError(status, key, message, cause) {
  if (APIError.super_.captureStackTrace) {
    APIError.super_.captureStackTrace(this, this.constructor);
  }
  this.name = this.constructor.name;
  this.status = status;
  this.key = key;
  this.message = message;
  if(cause) {
    this.cause = cause;
    this.stack = cause.stack;
  }
  this.json = function() {
    var json = {status: this.status, key: this.key, message: this.message};
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

function NotFoundError(key, message, cause) {
  NotFoundError.super_.call(this, 404, key, message, cause);
}
util.inherits(NotFoundError, APIError);

function getErrorKey(err) {
  if(err instanceof APIError) {
    return err.key;
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

function apiError(key, message, cause) {
  return new APIError(400, key, message, cause);
}

function unexpectedError(key, message, cause) {
  return new APIError(500, key, message, cause);
}

function notFoundError(key, message, cause) {
  return new NotFoundError(key, message, cause);
}

function validationError(prefix, err) {
  if(err instanceof ValidationError) {
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
    res.json(err.status, err.json());
  } else {
    var internal = unexpectedError('unexpected_error', err.message, err);
    res.json(internal.status, internal.json());
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