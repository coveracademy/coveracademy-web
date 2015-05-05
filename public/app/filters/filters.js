'use strict';

angular
.module('coverAcademy.filters', [])
.filter('partition', function() {
  var cache = {};
  return function(arr, size) {
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
})
.filter('inMinutes', function() {
  return function(str) {
    return Math.floor(parseInt(str) / 60);
  };
});