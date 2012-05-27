/////////////////////////////////////////////////////
// Comparison
/////////////////////////////////////////////////////

var eq = fmap(function (u, v) {
    return u == v;
});

var neq = fmap(function (u, v) {
    return u != v;
});

var lt = fmap(function (u, v) {
    return u < v;
});

var lteq = fmap(function (u, v) {
    return u <= v;
});

var gt = fmap(function (u, v) {
    return u > v;
});

var gteq = fmap(function (u, v) {
    return u >= v;
});

/////////////////////////////////////////////////////
// Arithmetic
/////////////////////////////////////////////////////

var add = fmap(function () {
    var ret = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        ret += arguments[i];
    }
    return ret;
});

var mult = fmap(function () {
    var ret = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        ret *= arguments[i];
    }
    return ret;
});

/////////////////////////////////////////////////////
// Unary
/////////////////////////////////////////////////////

var inc = fmap(function (a) {
    return ++a;
});

var dec = fmap(function (a) {
    return --a;
});
