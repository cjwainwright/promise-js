module("Variable");

test("Initialising a variable should set it's current promise", function(){
    var promise = laterData(1, 100);
    var a = new Variable(promise);
    strictEqual(a.current, promise);
});

test("Assigning to a variable should set it's current promise", function(){
    var promise = laterData(1, 100);
    var a = new Variable();
    a.assign(promise);
    strictEqual(a.current, promise);
});

test("Re-assigning to a variable should set it's current promise", function(){
    var promise1 = laterData(1, 100);
    var promise2 = laterData(2, 100);
    var a = new Variable();
    a.assign(promise1);
    a.assign(promise2);
    strictEqual(a.current, promise2);
});

promiseTest(
    "Re-assigning should not affect previously assigned promises",
    100,
    function () {
        var a = new Variable(laterData(1, 100));
        var current1 = a.current;
        a.assign(laterData(2, 100));
        return current1;
    },
    function (data) {
        strictEqual(data, 1);
    }
);

promiseTest(
    "Re-assigning should be able to use previously assigned promises (a = a + 2)",
    100,
    function () {
        var a = new Variable(laterData(1, 100));
        a.assign(add(a.current, laterData(2, 100)));
        return a.current;
    },
    function (data) {
        strictEqual(data, 3);
    }
);
