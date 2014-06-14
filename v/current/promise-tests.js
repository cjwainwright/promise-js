promise.exportTo(window);

var timeTolerance = 20;

function promiseTest(testName, expectedTime, callback, assertKept, assertBroken) {
    if (assertBroken == null) {
        assertBroken = function (time) { 
            ok(false, "Promise broken unexpectedly"); 
        };
    }
    asyncTest(testName, function(){
        var startTime = Date.now();
        var ret = callback();
        var timeout = setTimeout(function () {
            ok(false, "too slow - actual: " + (Date.now() - startTime) + ", expected: " + expectedTime);
            start();
        }, expectedTime + timeTolerance)
        ret.kept(function(data) {
            clearTimeout(timeout);
            if (Date.now() - startTime < expectedTime - timeTolerance) {
                ok(false, "too fast - actual: " + (Date.now() - startTime) + ", expected: " + expectedTime);
            }
            assertKept(data);
            start();
        }).broken(function() {
            clearTimeout(timeout);
            if (Date.now() - startTime < expectedTime - timeTolerance) {
                ok(false, "too fast - actual: " + (Date.now() - startTime) + ", expected: " + expectedTime);
            }
            assertBroken();
            start();
        });
    });
}

module("Promise");

test("A new Promise should be waiting", function () {
    var o = new Promise();
    strictEqual(o.state, "waiting");
});

test("When calling setData the kept method should be triggered", function () {
    var called = false;
    var o = new Promise();
    o.kept(function () {called = true;});
    o.setData(1);
    ok(called);
});

test("When calling setData multiple kept methods should be triggered", function () {
    var called = [];
    var o = new Promise();
    o.kept(function () {called[0] = true;});
    o.kept(function () {called[1] = true;});
    o.kept(function () {called[2] = true;});
    o.setData(1);
    deepEqual(called, [true, true, true]);
});

test("After calling setData the state should be kept", function () {
    var o = new Promise();
    o.setData(1);
    strictEqual(o.state, "kept");
});

test("When calling setBroken the broken method should be triggered", function () {
    var called = false;
    var o = new Promise();
    o.broken(function () {called = true;});
    o.setBroken();
    ok(called);
});

test("When calling setBroken multiple broken methods should be triggered", function () {
    var called = [];
    var o = new Promise();
    o.broken(function () {called[0] = true;});
    o.broken(function () {called[1] = true;});
    o.broken(function () {called[2] = true;});
    o.setBroken();
    deepEqual(called, [true, true, true]);
});

test("After calling setBroken the state should be broken", function () {
    var o = new Promise();
    o.setBroken();
    strictEqual(o.state, "broken");
});

test("When calling setData on a kept promise, an error should be thrown", function () {
    var o = new Promise();
    o.setData(1);
    raises(function(){
        o.setData(2);
    });
});

test("When calling setData on a broken promise, an error should be thrown", function () {
    var o = new Promise();
    o.setBroken();
    raises(function(){
        o.setData(2);
    });
});

test("When calling setBroken on a kept promise, an error should be thrown", function () {
    var o = new Promise();
    o.setData(1);
    raises(function(){
        o.setBroken();
    });
});

test("When calling setBroken on a broken promise, an error should be thrown", function () {
    var o = new Promise();
    o.setBroken();
    raises(function(){
        o.setBroken();
    });
});

test("Given a bound Promise, the data should be passed on", function () {
    var o1 = new Promise(),
        o2 = new Promise();
    o1.bindTo(o2);
    o1.setData(1);
    strictEqual(o2.state, "kept");
    strictEqual(o2.data, 1);
});

test("Given a bound Promise, the broken state should be passed on", function () {
    var o1 = new Promise(),
        o2 = new Promise();
    o1.bindTo(o2);
    o1.setBroken();
    strictEqual(o2.state, "broken");
});

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

module("Operators - eq");

promiseTest(
    "1 == 1 should be true", 
    0,
    function () {
        return eq(nowData(1), nowData(1));
    },
    function (data) {
        ok(data);
    }
);

promiseTest(
    "1' == 1' should be true", 
    100,
    function () {
        return eq(laterData(1, 50), laterData(1, 100));
    },
    function (data) {
        ok(data);
    }
);

promiseTest(
    "1 == 2 should be false", 
    0,
    function () {
        return eq(nowData(1), nowData(2));
    },
    function (data) {
        ok(!data);
    }
);

promiseTest(
    "1' == 2' should be false", 
    100,
    function () {
        return eq(laterData(1, 50), laterData(2, 100));
    },
    function (data) {
        ok(!data);
    }
);

module("Operators - lt");

promiseTest(
    "1 < 1 should be false", 
    0,
    function () {
        return lt(nowData(1), nowData(1));
    }, 
    function (data) {
        ok(!data);
    }
);

promiseTest(
    "1' < 1' should be false", 
    100,
    function () {
        return lt(laterData(1, 50), laterData(1, 100));
    },
    function (data, time) {
        ok(!data);
    }
);

promiseTest(
    "1 < 2 should be true", 
    0,
    function () {
        return lt(nowData(1), nowData(2));
    },
    function (data, time) {
        ok(data);
    }
);

promiseTest(
    "1' < 2' should be true", 
    100,
    function () {
        return lt(laterData(1, 50), laterData(2, 100));
    },
    function (data, time) {
        ok(data);
    }
);

module("DynamicObject");

promiseTest(
    "Setting a value immediately should return the value",
    0,
    function () {
        var a = new DynamicObject();
        return a.set(nowData('k'), nowData('v'));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "Setting a value with delayed key should return the value",
    0,
    function () {
        var a = new DynamicObject();
        return a.set(laterData('k', 100), nowData('v'));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "Setting a value with delayed key and value should return the value",
    50,
    function () {
        var a = new DynamicObject();
        return a.set(laterData('k', 100), laterData('v', 50));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "Getting a value with delayed key should return the last set value for that key", 
    100,
    function () {
        var a = new DynamicObject();
        a.set(laterData('k', 100), laterData('v', 50));
        return a.get(laterData('k', 50));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "Sets should happen in correct order, irrespective of order promises are kept", 
    100,
    function () {
        var a = new DynamicObject();
        a.set(laterData('k', 100), laterData('v1', 50));
        a.set(laterData('k', 50), laterData('v2', 50));
        return a.get(nowData('k'));
    },
    function (data) {
        strictEqual(data, 'v2');
    }
);

promiseTest(
    "Subsequent sets should not affect a waiting get", 
    100,
    function () {
        var a = new DynamicObject();
        a.set(laterData('k', 100), laterData('v1', 50));
        var ret = a.get(laterData('k', 50));
        a.set(nowData('k'), laterData('v2', 50));
        return ret;
    },
    function (data) {
        strictEqual(data, 'v1');
    }
);

promiseTest(
    "A new initialised DynamicObject should return correct values when calling get (immediate)",
    0,
    function () {
        var a = new DynamicObject({'k': nowData('v')});
        return a.get(nowData('k'));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "A new initialised DynamicObject should return correct values when calling get (delayed)",
    50,
    function () {
        var a = new DynamicObject({'k': laterData('v', 50)});
        return a.get(laterData('k', 50));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

// getMember tests

promiseTest(
    "getMember should return an object with the correct val (immediate)",
    0,
    function () {
        var a = unit(new DynamicObject({'k': nowData('v')}));
        return getMember(a, unit('k')).val;
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "getMember should return an object with the correct val (delayed)",
    50,
    function () {
        var a = unit(new DynamicObject({'k': laterData('v', 50)}));
        return getMember(a, laterData('k', 50)).val;
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "getMember should allow setting a val (immediate)",
    0,
    function () {
        var a = unit(new DynamicObject({'k': nowData('v')}));
        return getMember(a, unit('k')).val = nowData('v2');
    },
    function (data) {
        strictEqual(data, 'v2');
    }
);

promiseTest(
    "getMember should allow setting a val which is then retrievable (immediate)",
    0,
    function () {
        var a = unit(new DynamicObject({'k': nowData('v')}));
        getMember(a, unit('k')).val = nowData('v2');
        return getMember(a, unit('k')).val;
    },
    function (data) {
        strictEqual(data, 'v2');
    }
);

promiseTest(
    "getMember should allow setting a val which is then retrievable (delayed)",
    50,
    function () {
        var a = unit(new DynamicObject({'k': nowData('v')}));
        getMember(a, laterData('k', 50)).val = laterData('v2', 50);
        return getMember(a, unit('k')).val;
    },
    function (data) {
        strictEqual(data, 'v2');
    }
);

module("DynamicArray");

promiseTest(
    "A new uninitialised DynamicArray should have length 0", 
    0,
    function () {
        var a = new DynamicArray();
        return a.length();
    },
    function (data) {
        strictEqual(data, 0);
    }
);

promiseTest(
    "Setting a value immediately should return the value",
    0,
    function () {
        var a = new DynamicArray();
        return a.set(nowData(0), nowData('v'));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "Setting a value with delayed key should return the value",
    0,
    function () {
        var a = new DynamicArray();
        return a.set(laterData(0, 100), nowData('v'));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "Setting a value with delayed key and value should return the value",
    50,
    function () {
        var a = new DynamicArray();
        return a.set(laterData(0, 100), laterData('v', 50));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "Setting a value with key 0' should update the length to 1", 
    100,
    function () {
        var a = new DynamicArray();
        a.set(laterData(0, 100), laterData('v', 50));
        return a.length();
    },
    function (data) {
        strictEqual(data, 1);
    }
);

promiseTest(
    "Setting a value with key 2' should update the length to 3", 
    100,
    function () {
        var a = new DynamicArray();
        a.set(laterData(2, 100), laterData('v', 50));
        return a.length();
    },
    function (data) {
        strictEqual(data, 3);
    }
);

promiseTest(
    "Getting a value with delayed key should return the last set value for that key", 
    100,
    function () {
        var a = new DynamicArray();
        a.set(laterData(0, 100), laterData('v', 50));
        return a.get(laterData(0, 50));
    },
    function (data) {
        strictEqual(data, 'v');
    }
);

promiseTest(
    "Sets should happen in correct order, irrespective of order promises are kept", 
    100,
    function () {
        var a = new DynamicArray();
        a.set(laterData(2, 100), laterData('v1', 50));
        a.set(laterData(2, 50), laterData('v2', 50));
        return a.get(nowData(2));
    },
    function (data) {
        strictEqual(data, 'v2');
    }
);

promiseTest(
    "Subsequent sets should not affect a waiting get", 
    100,
    function () {
        var a = new DynamicArray();
        a.set(laterData(2, 100), laterData('v1', 50));
        var ret = a.get(laterData(2, 50));
        a.set(nowData(2), laterData('v2', 50));
        return ret;
    },
    function (data) {
        strictEqual(data, 'v1');
    }
);

promiseTest(
    "A new initialised DynamicArray should have correct length 1", 
    0,
    function () {
        var a = new DynamicArray([nowData('v')]);
        return a.length();
    },
    function (data) {
        strictEqual(data, 1);
    }
);

promiseTest(
    "A new initialised DynamicArray should have correct length 2", 
    0,
    function () {
        var a = new DynamicArray([nowData('v1'), laterData('v2', 50)]);
        return a.length();
    },
    function (data) {
        strictEqual(data, 2);
    }
);

promiseTest(
    "A new initialised DynamicArray should return correct values when calling get (immediate)",
    0,
    function () {
        var a = new DynamicArray([laterData('v1', 50), nowData('v2')]);
        return a.get(nowData(1));
    },
    function (data) {
        strictEqual(data, 'v2');
    }
);

promiseTest(
    "A new initialised DynamicArray should return correct values when calling get (delayed)",
    50,
    function () {
        var a = new DynamicArray([laterData('v1', 50), nowData('v2')]);
        return a.get(laterData(0, 50));
    },
    function (data) {
        strictEqual(data, 'v1');
    }
);

