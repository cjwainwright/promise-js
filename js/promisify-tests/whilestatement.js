module("WhileStatement");

testCompile(
    "while example - waits for condition to be resolved before continuing with loop",
    function anonymous(cont) {
        var b = 1;
        while(cont) {
            ++b;
        }
        return b;
    },
    function anonymous(cont) {
        var b = promise.unit(1);
        
        var $cont = cont, cont = new Promise();
        var $b = b, b = new Promise();
        (function loop() {
            $cont.kept(function (data) {
                if(data) {
                    ($b = promise.inc($b));
                    loop();
                } else {
                    $b.bindTo(b);
                    $cont.bindTo(cont);
                }
            }).broken(function(){
                throw new Error("Loop condition broken");
            });
        })();

        return b;
    }
)
