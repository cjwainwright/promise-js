module("ArrayExpression");

testCompile(
    "[]", 
    function anonymous() {
        [];
    },
    function anonymous() {
        promise.unit(new promise.DynamicArray([]));
    }
);

testCompile(
    "[a]", 
    function anonymous() {
        [a];
    },
    function anonymous() {
        promise.unit(new promise.DynamicArray([a]));
    }
);

testCompile(
    "[a, b]", 
    function anonymous() {
        [a, b];
    },
    function anonymous() {
        promise.unit(new promise.DynamicArray([a, b]));
    }
);

