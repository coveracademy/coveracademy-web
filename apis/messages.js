"use strict"

var settings = require('../configs/settings'),
    util     = require('util');

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
};
util.inherits(APIError, Error);

function getErrorKey(err) {
  if(err instanceof APIError) {
    return err.errorKey;
  } else {
    return 'internalError';
  }
}

function apiError(errorKey, errorMessage, cause) {
  return new APIError(400, errorKey, errorMessage, cause);
}

function apiErrorWithCode(statusCode, errorKey, errorMessage, cause) {
  return new APIError(statusCode, errorKey, errorMessage, cause);
}

function unexpectedError(errorMessage, cause) {
  return apiError('unexpectedError', errorMessage, cause);
}

function internalError(errorMessage, cause) {
  return apiErrorWithCode(500, 'internalError', errorMessage, cause);
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
  apiError: apiError,
  apiErrorWithCode: apiErrorWithCode,
  unexpectedError: unexpectedError,
  internalError: internalError,
  respondWithError: respondWithError,
  respondWithNotFound: respondWithNotFound,
  respondWithMovedPermanently: respondWithMovedPermanently,
  respondWithRedirection: respondWithRedirection,
  APIError: APIError
}