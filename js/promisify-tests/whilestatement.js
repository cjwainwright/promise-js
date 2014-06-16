module("WhileStatement");

testCompile(
    "while(true){}",
    function anonymous() {
        while(true){}
    },
    function anonymous() {
        (function loop() {
            promise.unit(true).kept(function (data) {
                if(data) {
                    {}
                    loop();
                } else {
                }
            }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
        })();
    }
);

testCompile(
    "var b; while(true){}",
    function anonymous() {
        var b;
        while(true){}
    },
    function anonymous() {
        var b;
        
        var $b = b, b = new promise.Promise();
        
        (function loop() {
            promise.unit(true).kept(function (data) {
                if(data) {
                    {}
                    loop();
                } else {
                    $b.bindTo(b);
                }
            }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
        })();
    }
);

testCompile(
    "var b = 0; while(b < 2){ ++b; }",
    function anonymous() {
        var b = 0;
        while(b < 2){
            ++b;
        }
    },
    function anonymous() {
        var b = promise.unit(0);
        
        var $b = b, b = new promise.Promise();
        
        (function loop() {
            promise.lt($b, promise.unit(2)).kept(function (data) {
                if(data) {
                    {
                        ($b = promise.inc($b));
                    }
                    loop();
                } else {
                    $b.bindTo(b);
                }
            }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
        })();
    }
);

testCompile(
    "while with multiple variables",
    function anonymous(cont) {
        var b = 1;
        while(cont) {
            ++b;
        }
        return b;
    },
    function anonymous(cont) {
        var b = promise.unit(1);
        
        var $cont = cont, cont = new promise.Promise();
        var $b = b, b = new promise.Promise();
        
        (function loop() {
            $cont.kept(function (data) {
                if(data) {
                    {
                        ($b = promise.inc($b));
                    }
                    loop();
                } else {
                    $cont.bindTo(cont);
                    $b.bindTo(b);
                }
            }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
        })();

        return b;
    }
);

// Nested while statements:

testCompile(
    "var b; while(true){ while(true) {} }",
    function anonymous() {
        var b;
        while(true) {
            while(true){
                ++b;
            }
        }
    },
    function anonymous() {
        var b;
        
        var $b = b, b = new promise.Promise();
        
        (function loop() {
            promise.unit(true).kept(function (data) {
                if(data) {
                    {
                        var $$b = $b, $b = new promise.Promise();
        
                        (function loop() {
                            promise.unit(true).kept(function (data) {
                                if(data) {
                                    {
                                        ($$b = promise.inc($$b));
                                    }
                                    loop();
                                } else {
                                    $$b.bindTo($b);
                                }
                            }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
                        })();
                    }
                    loop();
                } else {
                    $b.bindTo(b);
                }
            }).broken(promise.errorFunc(promise.error.conditionalBrokenPromise));
        })();
    }
);
