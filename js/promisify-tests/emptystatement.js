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
