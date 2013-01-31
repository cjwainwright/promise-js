function testCompile(name, source, expected) {
    test(name, function() {
        var result = promisify.compile(source);
        var resultSource = result.toSource();
        var resultTree = esprima.parse(resultSource);
        var expectedTree = esprima.parse(expected.toSource());
        deepEqual(resultTree, expectedTree, resultSource);
    });
}

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
    "Should be preseerved", 
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
