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
