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