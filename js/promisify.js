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

    var unaries = {
        '!': 'not'
    };
    
    var binaries = {
        '+': 'add',
        '*': 'mult',
        '==': 'eq',
        '!=': 'neq',
        '<': 'lt',
        '<=': 'lteq',
        '>': 'gt',
        '>=': 'gteq'
    };
    
    var updaters = {
        '++': 'inc',
        '--': 'dec'
    };

    var processors = {
        EmptyStatement: function (ast, code) {
        },
        BlockStatement: function (ast, code) {
            ast.body.forEach(function (stmt) {
                process(stmt, code);
                code.push('\n');
            });
        },
        ExpressionStatement: function (ast, code) {
            process(ast.expression, code);
        },
        ReturnStatement: function (ast, code) {
            code.push('return ');
            process(ast.argument, code);
            code.push(';');
        },
        Literal: function (ast, code) {
            code.push('promise.unit(', ast.raw, ')');
        },
        Identifier: function (ast, code) {
            code.push(ast.name, '.current');
        },
        VariableDeclaration: function (ast, code) {
            ast.declarations.forEach(function (decl) {
                code.push('var ', decl.id.name, ' = new promise.Variable(');
                process(decl.init, code);
                code.push(');');
            });
        },
        AssignmentExpression: function (ast, code) {
            switch(ast.left.type) {
                case 'Identifier': 
                    code.push(ast.left.name, '.assign(');
                    process(ast.right, code);
                    code.push(')');
                    break;
                case 'MemberExpression':
                    console.error("member expression assignments not currently supported");
                    break;
                default:
                    console.error("unknown left type for assignment expression: " + ast.left.type);
            }
        },
        UnaryExpression: function (ast, code) {
            var unary = unaries[ast.operator];
            if(unary != null) {
                code.push('promise.', unary, '(');
                process(ast.argument, code);
                code.push(')');
            } else {
                console.error("unknown unary operator " + ast.operator);
            }
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
        },
        UpdateExpression: function (ast, code) {
            switch(ast.argument.type) {
                case 'Identifier':
                    var assigner = ast.prefix ? 'assign' : 'assignPostfix';
                    var update = updaters[ast.operator];
                    if(update != null) {
                        code.push(ast.argument.name, '.', assigner, '(promise.', update, '(', ast.argument.name, '.current))');
                    }
                    break;
                case 'MemberExpression':
                    console.error("member expression assignments not currently supported");
                    break;
                default:
                    console.error("unknown argument type for update expression: " + ast.argument.type);
            }
        }
    }

    function compile(f) {
        var ast = esprima.parse(f.toSource());
        
        if(ast.body[0].type != 'FunctionDeclaration') {
            throw "Not a function declaration";
        }
        
        var functionDecl = ast.body[0];
        if(functionDecl.body.type != 'BlockStatement') {
            throw "Function doesn't contain block statement";
        }
        
        var params = functionDecl.params;
        var args = params.map(function (param) { return param.name; } );
        
        var code = [];
        
        //preamble - convert the promises passed in to the function into variables, we can overwrite the actual function args as they'll only be used in variable form
        args.forEach(function (arg) {
            code.push(arg, ' = new promise.Variable(', arg, ');\n');
        });
        process(functionDecl.body, code);

        args.push(code.join(''));
        return Function.apply(null, args)
    }
    
    exports.compile = compile;
    
})(typeof exports === 'undefined' ? (promisify = {}) : exports);