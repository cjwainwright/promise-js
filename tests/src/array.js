module("DynamicArray");

promiseTest(
    "A new DynamicArray should have length 0", 
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
        return a.set(nowData(0), nowData(1));
    },
    function (data) {
        strictEqual(data, 1);
    }
);

promiseTest(
    "Setting a value with delayed key should return the value",
    0,
    function () {
        var a = new DynamicArray();
        return a.set(laterData(0, 100), nowData(1));
    },
    function (data) {
        strictEqual(data, 1);
    }
);

promiseTest(
    "Setting a value with delayed key and value should return the value",
    50,
    function () {
        var a = new DynamicArray();
        return a.set(laterData(0, 100), laterData(1, 50));
    },
    function (data) {
        strictEqual(data, 1);
    }
);

promiseTest(
    "Setting a value with key 0' should update the length to 1", 
    100,
    function () {
        var a = new DynamicArray();
        a.set(laterData(0, 100), laterData(1, 50));
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
        a.set(laterData(0, 100), laterData(1, 50));
        return a.length();
    },
    function (data) {
        strictEqual(data, 1);
    }
);

promiseTest(
    "Getting a value with delayed key should return the last set value for that key", 
    100,
    function () {
        var a = new DynamicArray();
        a.set(laterData(0, 100), laterData(1, 50));
        return a.get(laterData(0, 50));
    },
    function (data) {
        strictEqual(data, 1);
    }
);

promiseTest(
    "Sets should happen in correct order, irrespective of order promises are kept", 
    100,
    function () {
        var a = new DynamicArray();
        a.set(laterData(2, 100), laterData(1, 50));
        a.set(laterData(2, 50), laterData(2, 50));
        return a.get(nowData(2));
    },
    function (data) {
        strictEqual(data, 2);
    }
);

promiseTest(
    "Subsequent sets should not affect a waiting get", 
    100,
    function () {
        var a = new DynamicArray();
        a.set(laterData(2, 100), laterData(1, 50));
        var ret = a.get(laterData(2, 50));
        a.set(nowData(2), laterData(2, 50));
        return ret;
    },
    function (data) {
        strictEqual(data, 1);
    }
);