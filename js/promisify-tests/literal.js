module("Literal");

testCompile(
    "null", 
    function anonymous() {
        null;
    },
    function anonymous() {
        promise.unit(null);
    }
);

testCompile(
    "Number", 
    function anonymous() {
        1;
    },
    function anonymous() {
        promise.unit(1);
    }
);

testCompile(
    "String", 
    function anonymous() {
        'test string';
    },
    function anonymous() {
        promise.unit('test string');
    }
);

