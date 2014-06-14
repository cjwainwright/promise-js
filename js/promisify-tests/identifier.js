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

