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
        return a.get(laterData(0, 50)).current;
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
        return a.get(nowData(2)).current;
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
        var ret = a.get(laterData(2, 50)).current;
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
        return a.get(nowData(1)).current;
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
        return a.get(laterData(0, 50)).current;
    },
    function (data) {
        strictEqual(data, 'v1');
    }
);