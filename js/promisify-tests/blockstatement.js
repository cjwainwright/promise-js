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

