module("ObjectExpression");

testCompile(
    "{}", 
    function anonymous() {
        ({});
    },
    function anonymous() {
        promise.unit(new promise.DynamicObject({}));
    }
);

testCompile(
    "{a: 1}", 
    function anonymous() {
        ({a: 1});
    },
    function anonymous() {
        promise.unit(new promise.DynamicObject({a: promise.unit(1)}));
    }
);

testCompile(
    "{a: b}", 
    function anonymous() {
        ({a: b});
    },
    function anonymous() {
        promise.unit(new promise.DynamicObject({a: b}));
    }
);

testCompile(
    "{a: b, c: d}", 
    function anonymous() {
        ({a: b, c: d});
    },
    function anonymous() {
        promise.unit(new promise.DynamicObject({a: b, c: d}));
    }
);

