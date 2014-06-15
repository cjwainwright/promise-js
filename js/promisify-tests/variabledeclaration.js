module("VariableDeclaration");

testCompile(
    "var a;", 
    function anonymous() {
        var a;
    },
    function anonymous() {
        var a;
    }
);

testCompile(
    "var a = 1;", 
    function anonymous() {
        var a = 1;
    },
    function anonymous() {
        var a = promise.unit(1);
    }
);

testCompile(
    "var a, b;", 
    function anonymous() {
        var a, b;
    },
    function anonymous() {
        var a, b;
    }
);

testCompile(
    "var a = 1, b;", 
    function anonymous() {
        var a = 1, b;
    },
    function anonymous() {
        var a = promise.unit(1), b;
    }
);

testCompile(
    "var promise;",
    function anonymous() {
        var promise;
    },
    function anonymous() {
        var $promise;
    }
);

testCompile(
    "var promise = 1;",
    function anonymous() {
        var promise = 1;
    },
    function anonymous() {
        var $promise = promise.unit(1);
    }
);

testCompile(
    "var $promise;",
    function anonymous() {
        var $promise;
    },
    function anonymous() {
        var $promise;
    }
);

testCompile(
    "var promise, $promise;",
    function anonymous() {
        var promise, $promise;
    },
    function anonymous() {
        var $promise, $$promise;
    }
);