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
