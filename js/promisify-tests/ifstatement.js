module("IfStatement");

testCompile(
    "if later example - waits for condition resoution before evaluating branches",
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
        
        var $b = b, b = new promise.Promise();
        test.kept(function(data){
            if (data) {
                ($b = promise.inc($b));
            } else {
                ($b = promise.dec($b));
            }
            $b.bindTo(b);
        }).broken(promise.errorFunc("Can't use broken promise as predicate"));
        
        return b;
    }
);

testCompile(
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
        }).broken(function () {
            throw new Error("Can't use broken promise as predicate");
        });
        
        return b;
    }
);
