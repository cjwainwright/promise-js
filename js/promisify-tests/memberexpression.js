module("MemberExpression");

testCompile(
    "a[0]",
    function anonymous() {
        a[0];
    },
    function anonymous() {
        promise.getMember(a, promise.unit(0)).val;
    }
);

testCompile(
    "a[b]",
    function anonymous() {
        a[b];
    },
    function anonymous() {
        promise.getMember(a, b).val;
    }
);

testCompile(
    "a.b",
    function anonymous() {
        a.b;
    },
    function anonymous() {
        promise.getMember(a, promise.unit('b')).val;
    }
);

