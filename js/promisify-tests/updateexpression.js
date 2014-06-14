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
