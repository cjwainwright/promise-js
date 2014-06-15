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

//#include general.js
//#include emptystatement.js
//#include blockstatement.js
//#include literal.js
//#include objectexpression.js
//#include arrayexpression.js
//#include returnstatement.js
//#include variabledeclaration.js
//#include identifier.js
//#include memberexpression.js
//#include assignmentexpression.js
//#include unaryexpression.js
//#include binaryexpression.js
//#include updateexpression.js
//#include ifstatement.js
//#include whilestatement.js
