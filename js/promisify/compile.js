// TODO - need to handle function scope

function compile(f) {
    var ast = parse(f.toSource());
    
    var functionDecl = ast.body[0];
    if(functionDecl.type != 'FunctionDeclaration') {
        if(ast.body[0].expression && ast.body[0].expression.type == 'FunctionExpression') {
            functionDecl = ast.body[0].expression;
        } else {
            throw new Error("Not a function declaration");
        }
    }
    
    if(functionDecl.body.type != 'BlockStatement') {
        throw new Error("Function doesn't contain block statement");
    }
    
    var params = functionDecl.params;
    var args = params.map(function (param) { return param.name; } );
    
    var code = [];
    var varMap = new VarMap();
    varMap.reserve(nsName);
    args.forEach(varMap.get.bind(varMap));

    // process each statement inside the function body to avoid duplicate block statement inside resulting function
    functionDecl.body.body.forEach(function (stmt) {
        process(stmt, code, varMap);
    });

    args.push(code.join(''));
    
    return Function.apply(null, args);
}

function map(input) {
    var code = [];
    var varMap = new VarMap();
    varMap.reserve(nsName);

    var ast = parse(input, code);
    
    process(ast, code, varMap);
    
    return code.join('');
}

exports.map = map;
exports.compile = compile;