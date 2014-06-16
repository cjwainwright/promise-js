module("IfStatement");

testCompile(
    "if(true) { }",
    function anonymous() {
        if(true) { }
    },
    function anonymous() {
        promise.unit(true).kept(function(data){
            if(data){}
        }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
    }
);

testCompile(
    "if(true) { } else { }",
    function anonymous() {
        if(true) { } else { }
    },
    function anonymous() {
        promise.unit(true).kept(function(data){
            if(data) { } else { }
        }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
    }
);

testCompile(
    "var b; if(true) { }",
    function anonymous() {
        var b;
        if(true) { }
    },
    function anonymous() {
        var b;
        var $b = b, b = new promise.Promise();
        promise.unit(true).kept(function(data){
            if(data){}
            $b.bindTo(b);
        }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
    }
);

testCompile(
    "var b = 1; if(b) { }",
    function anonymous() {
        var b = 1;
        if(b) { }
    },
    function anonymous() {
        var b = promise.unit(1);
        var $b = b, b = new promise.Promise();
        $b.kept(function(data){
            if(data){}
            $b.bindTo(b);
        }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
    }
);

testCompile(
    "var b = 1; if(b) { ++b; }",
    function anonymous() {
        var b = 1;
        if(b) { ++b; }
    },
    function anonymous() {
        var b = promise.unit(1);
        var $b = b, b = new promise.Promise();
        $b.kept(function(data){
            if(data) {
                ($b = promise.inc($b));
            }
            $b.bindTo(b);
        }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
    }
);

testCompile(
    "if with multiple variables",
    function anonymous(test) {
        var b = 1, 
            c = 2;
            
        if (test) {
            ++b;
        } else {
            --c;
        }
    },
    function anonymous(test) {
        var b = promise.unit(1), 
            c = promise.unit(2);
        
        var $test = test, test = new promise.Promise();
        var $b = b, b = new promise.Promise();
        var $c = c, c = new promise.Promise();
        $test.kept(function(data){
            if (data) {
                ($b = promise.inc($b));
            } else {
                ($c = promise.dec($c));
            }
            $test.bindTo(test);
            $b.bindTo(b);
            $c.bindTo(c);
        }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
    }
);

// Nested if statements:

testCompile(
    "var b; if(true) { if(true) {} }",
    function anonymous() {
        var b;
        if(true) { if(true) {} }
    },
    function anonymous() {
        var b;
        var $b = b, b = new promise.Promise();
        promise.unit(true).kept(function(data){
            if(data){
                var $$b = $b, $b = new promise.Promise();
                promise.unit(true).kept(function(data){
                    if(data) {}
                    $$b.bindTo($b);
                }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
            }
            $b.bindTo(b);
        }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
    }
);

testCompile(
    "var b = 1; if(b) { --b; if(b) { --b;} }",
    function anonymous() {
        var b = 1; 
        if(b) { 
            --b; 
            if(b) { 
                --b;
            } 
        }
    },
    function anonymous() {
        var b = promise.unit(1);
        var $b = b, b = new promise.Promise();
        $b.kept(function(data){
            if(data){
                ($b = promise.dec($b));
                var $$b = $b, $b = new promise.Promise();
                $$b.kept(function(data){
                    if(data) {
                        ($$b = promise.dec($$b));
                    }
                    $$b.bindTo($b);
                }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
            }
            $b.bindTo(b);
        }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
    }
);

// Ignored tests:

testIgnore(
    "if now example - evaluates all branches up front then assigns correct vars when condition resolved",
    function anonymous(test) {
        var b = 1;
        if (test) {
            ++b;
        } else {
            --b;
        }
        return b;
    },
    function anonymous(test) {
        var b = promise.unit(1);
        
        var $1b = b, $2b = b, b = new promise.Promise();
        ($1b = promise.inc($1b));
        ($2b = promise.dec($2b));
        test.kept(function(data){
            if (data) {
                $1b.bindTo(b);
            } else {
                $2b.bindTo(b);
            }
        }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
        
        return b;
    }
);
