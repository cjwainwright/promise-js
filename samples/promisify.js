(function (exports) {
    var process = function(ast, code) {
        if(ast != null) {
            var processor = processors[ast.type];
            if(processor) {
                processor(ast, code);
            } else {
                console.error("unknown type " + ast.type);
            }
        }
    };

    var binaries = {
        '+': 'add',
        '*': 'mult'
    };

    var processors = {
        BlockStatement: function (ast, code) {
            ast.body.forEach(function (stmt) {
                process(stmt, code);
                code.push('\n');
            });
        },
        Literal: function (ast, code) {
            code.push('promise.nowData(', ast.raw, ')'); //TODO - rename nowData to unit
        },
        VariableDeclaration: function (ast, code) {
            ast.declarations.forEach(function (decl) {
                code.push('var ', decl.id.name, ' = new promise.Variable(');
                process(decl.init, code);
                code.push(');');
            });
        },
        Identifier: function (ast, code) {
            code.push(ast.name, '.current');
        },
        ReturnStatement: function (ast, code) {
            code.push('return ');
            process(ast.argument, code);
            code.push(';');
        },
        BinaryExpression: function (ast, code) {
            var binary = binaries[ast.operator];
            if(binary != null) {
                code.push('promise.', binary, '(');
                process(ast.left, code);
                code.push(', ');
                process(ast.right, code);
                code.push(')');
            } else {
                console.error("unknown binary operator " + ast.operator);
            }
        }
    }

    function compile(f) {
        var ast = esprima.parse(f.toSource());
        
        if(ast.body[0].type != 'FunctionDeclaration') {
            throw "Not a function declaration";
        }
        
        var functionDecl = ast.body[0];
        
        var params = functionDecl.params;
        
        if(functionDecl.body.type != 'BlockStatement') {
            throw "Function doesn't contain block statement";
        }
        
        var code = [];
        process(functionDecl.body, code);
                        
        var args = params.map(function (param) { return param.name; } );
        args.push(code.join(''));
        return Function.apply(null, args)
    }
    
    exports.compile = compile;
    
})(typeof exports === 'undefined' ? (promisify = {}) : exports);