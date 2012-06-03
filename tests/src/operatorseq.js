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