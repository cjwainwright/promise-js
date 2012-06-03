module("fmap");

promiseTest(
    "Given a function with no arguments, should wrap return value in a kept promise",
    0,
    function () {
        return fmap(function(){ return 1; })();
    },
    function (data) {
        strictEqual(data, 1);
    }
);

promiseTest(
    "Given a function with one argument, when argument kept, should wrap return value",
    100,
    function () {
        var arg = laterData(1, 100);
        return fmap(function(a){ return a + 1; })(arg);
    },
    function (data) {
        strictEqual(data, 2);
    }
);

promiseTest(
    "Given a function with one argument, when argument broken, should break return value",
    100,
    function () {
        var arg = laterBreak(100);
        return fmap(function(a){ return a + 1; })(arg);
    },
    function (data) {
        ok(false);
    },
    function (data) {
        ok(true);
    }
);

promiseTest(
    "Given a function with two arguments, when both arguments kept, should wrap return value",
    100,
    function () {
        var arg1 = laterData(1, 100);
        var arg2 = laterData(2, 50);
        return fmap(function(a, b){ return a + b; })(arg1, arg2);
    },
    function (data) {
        strictEqual(data, 3);
    }
);

promiseTest(
    "Given a function with two arguments, when one argument broken, should break return value",
    50,
    function () {
        var arg1 = laterData(1, 100);
        var arg2 = laterBreak(50);
        return fmap(function(a, b){ return a + b; })(arg1, arg2);
    },
    function (data) {
        ok(false);
    },
    function (data) {
        ok(true);
    }
);

promiseTest(
    "Given a function with five arguments, when all arguments kept, should wrap return value",
    100,
    function () {
        var args = [
            laterData(1, 100),
            laterData(2, 120),
            laterData(3, 50),
            laterData(4, 100),
            laterData(5, 80)
        ];
        return fmap(function(){ return [].slice.call(arguments); }).apply(null, args);
    },
    function (data) {
        deepEqual(data, [1, 2, 3, 4, 5]);
    }
);

promiseTest(
    "Given a function with five arguments, when one argument broken, should break return value",
    50,
    function () {
        var args = [
            laterData(1, 100),
            laterData(2, 120),
            laterBreak(50),
            laterData(4, 100),
            laterData(5, 80)
        ];
        return fmap(function(){ return [].slice.call(arguments); }).apply(null, args);
    },
    function (data) {
        ok(false);
    },
    function (data) {
        ok(true);
    }
);

promiseTest(
    "Given a function with five arguments, when two arguments broken, should break return value",
    50,
    function () {
        var args = [
            laterBreak(100),
            laterData(2, 120),
            laterBreak(50),
            laterData(4, 100),
            laterData(5, 80)
        ];
        return fmap(function(){ return [].slice.call(arguments); }).apply(null, args);
    },
    function (data) {
        ok(false);
    },
    function (data) {
        ok(true);
    }
);