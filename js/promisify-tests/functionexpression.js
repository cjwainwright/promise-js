module("FunctionExpression");

testCompile(
    "var a = function(){}", 
    function anonymous() {
        var a = function(){};
    },
    function anonymous() {
        var a = promise.unit(function(){});
    }
);

testCompile(
    "var a = function fn(){}", 
    function anonymous() {
        var a = function fn(){};
    },
    function anonymous() {
        var a = promise.unit(function fn(){});
    }
);

testCompile(
    "var a = function fn(a, b, c){}", 
    function anonymous() {
        var a = function fn(a, b, c){};
    },
    function anonymous() {
        var a = promise.unit(function fn(a, b, c){});
    }
);

testCompile(
    "var a = function fn(a, b, c){ return a + b + c; }", 
    function anonymous() {
        var a = function fn(a, b, c){
            return a + b + c;
        };
    },
    function anonymous() {
        var a = promise.unit(function fn(a, b, c){
            return promise.add(promise.add(a, b), c);
        });
    }
);