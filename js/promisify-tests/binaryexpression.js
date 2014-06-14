module("BinaryExpression");

testCompile(
    "0 + 1",
    function anonymous() {
        0 + 1;
    },
    function anonymous() {
        promise.add(promise.unit(0), promise.unit(1));
    }
);

testCompile(
    "a * 1",
    function anonymous() {
        a * 1;
    },
    function anonymous() {
        promise.mult(a, promise.unit(1));
    }
);

testCompile(
    "a + b",
    function anonymous() {
        a + b;
    },
    function anonymous() {
        promise.add(a, b);
    }
);

