var PromiseWrapper = function(promise) {
  this._promise = promise;
};

PromiseWrapper.prototype.value = function() {
  return this._promise;
};

exports.PromiseWrapper = PromiseWrapper;