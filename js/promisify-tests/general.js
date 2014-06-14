module("General");

testCompile(
    "No statements", 
    function anonymous() {
    },
    function anonymous() {
    }
);

testCompile(
    "1 argument", 
    function anonymous(a) {
    },
    function anonymous(a) {
    }
);

testCompile(
    "2 arguments", 
    function anonymous(a, b) {
    },
    function anonymous(a, b) {
    }
);

//TODO - compile errors...
