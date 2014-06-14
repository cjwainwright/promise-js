module("AssignmentExpression");

testCompile(
    "a = 2;",
    function anonymous() {
        a = 2;
    },
    function anonymous() {
        a = promise.unit(2);
    }
);

testCompile(
    "a = b;",
    function anonymous() {
        a = b;
    },
    function anonymous() {
        a = b;
    }
);

testCompile(
    "a[0] = 2;",
    function anonymous() {
        a[0] = 2;
    },
    function anonymous() {
        promise.getMember(a, promise.unit(0)).val = promise.unit(2);
    }
);

testCompile(
    "a[0] = b[1];",
    function anonymous() {
        a[0] = b[1];
    },
    function anonymous() {
        promise.getMember(a, promise.unit(0)).val = promise.getMember(b, promise.unit(1)).val;
    }
);

