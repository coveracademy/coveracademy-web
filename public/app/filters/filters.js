angular
.module("coverChallengeApp")
.filter("partition", function() {
  var cache = {};
  var filter = function(arr, size) {
    if (!arr) { return; }
    var newArray = [];
    for (var i = 0; i < arr.length; i += size) {
      newArray.push(arr.slice(i, i + size));
    }
    var arrString = JSON.stringify(arr);
    var fromCache = cache[arrString + size];
    if (JSON.stringify(fromCache) === JSON.stringify(newArray)) {
      return fromCache;
    }
    cache[arrString + size] = newArray;
    return newArray;
  };
  return filter;
});