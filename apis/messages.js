"use strict"

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
    res.json(err.statusCode, err.toJSON());
  } else {
    var internal = internalError(err.message, err);
    res.json(internal.statusCode, internal.toJSON());
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