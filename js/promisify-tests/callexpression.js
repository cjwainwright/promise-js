module("CallExpression");

testCompile(
    "f()", 
    function anonymous() {
        f();
    },
    function anonymous() {
        (function () {
            var args = arguments;
            return f.thenData(function (data) {
                return data.apply(null, args);
            });
        })();
    }
);

testCompile(
    "f(a)", 
    function anonymous() {
        f(a);
    },
    function anonymous() {
        (function () {
            var args = arguments;
            return f.thenData(function (data) {
                return data.apply(null, args);
            });
        })(a);
    }
);

testCompile(
    "f(a, b, 3)", 
    function anonymous() {
        f(a, b, 3);
    },
    function anonymous() {
        (function () {
            var args = arguments;
            return f.thenData(function (data) {
                return data.apply(null, args);
            });
        })(a, b, promise.unit(3));
    }
);

testCompile(
    "o.f()", 
    function anonymous() {
        o.f();
    },
    function anonymous() {
        (function () {
            var args = arguments;
            return promise.getMember(o, promise.unit('f')).val.thenData(function (data) {
                return data.apply(o, args);
            });
        })();
    }
);

testCompile(
    "o.f(a, b, 3)", 
    function anonymous() {
        o.f(a, b, 3);
    },
    function anonymous() {
        (function () {
            var args = arguments;
            return promise.getMember(o, promise.unit('f')).val.thenData(function (data) {
                return data.apply(o, args);
            });
        })(a, b, promise.unit(3));
    }
);

testCompile(
    "o.m.f()", 
    function anonymous() {
        o.m.f();
    },
    function anonymous() {
        (function () {
            var args = arguments;
            return promise.getMember(promise.getMember(o, promise.unit('m')).val, promise.unit('f')).val.thenData(function (data) {
                return data.apply(promise.getMember(o, promise.unit('m')).val, args);
            });
        })();
    }
);