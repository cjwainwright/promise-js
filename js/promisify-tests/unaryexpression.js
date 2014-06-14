module("UnaryExpression");

testCompile(
    "!false",
    function anonymous() {
        !false;
    },
    function anonymous() {
        promise.not(promise.unit(false));
    }
);

testCompile(
    "!a",
    function anonymous() {
        !a;
    },
    function anonymous() {
        promise.not(a);
    }
);

