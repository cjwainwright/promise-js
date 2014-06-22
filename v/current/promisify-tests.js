function testCompile(name, source, expected) {
    test(name, function() {
        var result = promisify.compile(source);
        var resultSource = result.toSource();
        var resultTree = esprima.parse(resultSource);
        var expectedTree = esprima.parse(expected.toSource());
        deepEqual(resultTree, expectedTree, resultSource);
    });
}

function testIgnore() {}

module("VarMap", {
    setup: function () {
        this.map = new promisify.VarMap();
    }
});

test("unreserved and unmapped values should be unchanged", function () {
    var map = this.map;
    ['a', 'b', 'c', 'qwerty', 'promise', '$promise'].forEach(function (val) {
        strictEqual(map.get(val), val, val);
    });
});

test("mapped value should be consistent on each retrieval", function () {
    var map = this.map;
    
    var val = map.get('a');
    
    strictEqual(map.get('a'), val);
    strictEqual(map.get('a'), val);
    strictEqual(map.get('a'), val);
});

test("forEach should not iterate when no values mapped", function () {
    var map = this.map;
    
    var called = false;
    var val = map.forEach(function () {
        called = true;
    });
    
    ok(!called);
});

test("forEach should iterate over all map values", function () {
    var map = this.map;
    
    var keys = ['a', 'b', 'c'], 
        vals = [];
    
    keys.forEach(function (key) {
        vals.push(map.get(key));
    });
        
    map.forEach(function (key, val) {
        var keyExpected = keys.shift();
        var valExpected = vals.shift();
        
        strictEqual(key, keyExpected);
        strictEqual(val, valExpected);
    });
    
    strictEqual(keys.length, 0);
});

test("reserved values should map to next available prefixed value", function () {
    var map = this.map;
    map.reserve('test');
    var val = map.get('test');
    
    strictEqual(val, '$test');
});

test("reserved values should map to next available prefixed value when first also reserved", function () {
    var map = this.map;
    map.reserve('test');
    map.reserve('$test');
    
    strictEqual(map.get('test'), '$$test');
});

test("reserved values should map to next available prefixed value when multiple also reserved", function () {
    var map = this.map;
    map.reserve('test');
    map.reserve('$test');
    map.reserve('$$test');
    map.reserve('$$$test');
    
    strictEqual(map.get('test'), '$$$$test');
});

test("reserved values should map to next available prefixed value when first also mapped", function () {
    var map = this.map;
    map.reserve('test');
    map.get('$test'); 
    
    strictEqual(map.get('test'), '$$test');
});

test("reserved values should map to next available prefixed value when multiple also mapped", function () {
    var map = this.map;
    map.reserve('test');
    map.get('$test'); 
    map.get('$$test'); 
    map.get('$$$test'); 
    
    strictEqual(map.get('test'), '$$$$test');
});

test("branch should return a new VarMap", function () {
    var map = this.map;
    
    var branchMap = map.branch();
    
    ok(branchMap instanceof promisify.VarMap);
    notStrictEqual(branchMap, map);
});

test("when value mapped, retrieving same value from branch map should return next available prefixed value", function () {
    var map = this.map;
    map.get('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('a'), '$a');
});

test("when value mapped, retrieving different value from branch map should return next available prefixed value", function () {
    var map = this.map;
    map.get('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('b'), '$b');
});

test("when value reserved and mapped, retrieving same value from branch map should return next available prefixed value", function () {
    var map = this.map;
    map.reserve('a');
    map.get('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('a'), '$$a');
});

test("when value reserved, retrieving same value from branch map should return next available prefixed value", function () {
    // should behave same as if reserved and mapped
    var map = this.map;
    map.reserve('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('a'), '$$a');
});

test("when value first accessed in source map after branching, retrieving same value from branch map should return next available prefixed value", function () {
    var map = this.map;
    var branchMap = map.branch();    
    
    var val = map.get('a');
    
    strictEqual(branchMap.get('a'), '$a');
});

test("when value first accessed in branch map without access in source map, should behave as if already accessed in source map", function () {
    var map = this.map;
    
    var branchMap = map.branch();    
    
    var branchVal = branchMap.get('a');
    var val = map.get('a');
    
    strictEqual(val, 'a');
    strictEqual(branchVal, '$a');
});

test("when value reserved in source map after branching, should behave as if also reserved in branch map", function () {
    var map = this.map;
    
    var branchMap = map.branch();
    
    map.reserve('a');

    strictEqual(branchMap.get('a'), '$$a');
});

test("branching a second time should not affect the first branch (get)", function () {
    var map = this.map;
    var branchMap = map.branch();    
    var branchMap2 = map.branch();    
    
    map.get('a');
    
    strictEqual(branchMap.get('a'), '$a');
});

test("branching a second time should not affect the first branch (reserve)", function () {
    var map = this.map;
    var branchMap = map.branch();    
    var branchMap2 = map.branch();    
    
    map.reserve('a');
    
    strictEqual(branchMap.get('a'), '$$a');
});

test("second branch should behave as the first branch (get)", function () {
    var map = this.map;
    var branchMap = map.branch();    
    var branchMap2 = map.branch();    
    
    map.get('a');
    
    strictEqual(branchMap2.get('a'), '$a');
});

test("second branch should behave as the first branch (reserve)", function () {
    var map = this.map;
    var branchMap = map.branch();    
    var branchMap2 = map.branch();    
    
    map.reserve('a');
    
    strictEqual(branchMap2.get('a'), '$$a');
});

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

module("EmptyStatement");

testCompile(
    "Should be preserved", 
    function anonymous() {
        ;
    },
    function anonymous() {
        ;
    }
);

module("BlockStatement");

testCompile(
    "Should be preserved",
    function anonymous() {
        {}
    },
    function anonymous() {
        {}
    }
);


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


module("ObjectExpression");

testCompile(
    "{}", 
    function anonymous() {
        ({});
    },
    function anonymous() {
        promise.unit(new promise.DynamicObject({}));
    }
);

testCompile(
    "{a: 1}", 
    function anonymous() {
        ({a: 1});
    },
    function anonymous() {
        promise.unit(new promise.DynamicObject({a: promise.unit(1)}));
    }
);

testCompile(
    "{a: b}", 
    function anonymous() {
        ({a: b});
    },
    function anonymous() {
        promise.unit(new promise.DynamicObject({a: b}));
    }
);

testCompile(
    "{a: b, c: d}", 
    function anonymous() {
        ({a: b, c: d});
    },
    function anonymous() {
        promise.unit(new promise.DynamicObject({a: b, c: d}));
    }
);


module("ArrayExpression");

testCompile(
    "[]", 
    function anonymous() {
        [];
    },
    function anonymous() {
        promise.unit(new promise.DynamicArray([]));
    }
);

testCompile(
    "[a]", 
    function anonymous() {
        [a];
    },
    function anonymous() {
        promise.unit(new promise.DynamicArray([a]));
    }
);

testCompile(
    "[a, b]", 
    function anonymous() {
        [a, b];
    },
    function anonymous() {
        promise.unit(new promise.DynamicArray([a, b]));
    }
);


module("ReturnStatement");

testCompile(
    "return;", 
    function anonymous() {
        return;
    },
    function anonymous() {
        return promise.unit();
    }
);

testCompile(
    "return value;", 
    function anonymous() {
        return 1;
    },
    function anonymous() {
        return promise.unit(1);
    }
);


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

module("Identifier");

testCompile(
    "a", 
    function anonymous() {
        a;
    },
    function anonymous() {
        a;
    }
);


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


module("UpdateExpression");

testCompile(
    "++a",
    function anonymous() {
        ++a;
    },
    function anonymous() {
        (a = promise.inc(a));
    }
);

testCompile(
    "--a[b]",
    function anonymous() {
        --a[b];
    },
    function anonymous() {
        (promise.getMember(a, b).val = promise.dec(promise.getMember(a,b).val));
    }
);

testCompile(
    "a++",
    function anonymous() {
        a++;
    },
    function anonymous() {
        (function () { 
            var $ret = a; 
            a = promise.inc(a); 
            return $ret; 
        }());
    }
);

testCompile(
    "a[b]--",
    function anonymous() {
        a[b]--;
    },
    function anonymous() {
        (function () { 
            var $ret = promise.getMember(a, b).val; 
            promise.getMember(a, b).val = promise.dec(promise.getMember(a,b).val);
            return $ret; 
        }());
    }
);

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

