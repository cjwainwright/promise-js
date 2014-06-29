var process = function(ast, code, varMap) {
    if(ast != null) {
        var processor = processors[ast.type];
        if(processor) {
            processor(ast, code, varMap);
        } else {
            code.push('/* unknown type ', ast.type, ' */')
            log.error("unknown type " + ast.type);
            log.log(ast);
        }
    }
};

var nsName = 'promise',
    ns = nsName + '.',
    terminator = ';\n'

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

var _getKey = function(ast) {
    switch(ast.type) {
        case 'Literal': return ast.raw;
        case 'Identifier': return ast.name;
    }
    log.error("unknown key type " + ast.type);
}

var processors = {
    Program: function (ast, code, varMap) {
        ast.body.forEach(function (stmt) {
            process(stmt, code, varMap);
        });
    },
    EmptyStatement: function (ast, code, varMap) {
        code.push(terminator);
    },
    BlockStatement: function (ast, code, varMap) {
        code.push('{\n');
        ast.body.forEach(function (stmt) {
            process(stmt, code, varMap);
        });
        code.push('}');
    },
    ExpressionStatement: function (ast, code, varMap) {
        process(ast.expression, code, varMap);
        code.push(terminator);
    },
    ReturnStatement: function (ast, code, varMap) {
        code.push('return ');
        if(ast.argument) {
            process(ast.argument, code, varMap);
        } else {
            code.push(ns, 'unit()')
        }
        code.push(terminator);
    },
    Literal: function (ast, code, varMap) {
        code.push(ns, 'unit(', ast.raw, ')');
    },
    Identifier: function (ast, code, varMap) {
        code.push(varMap.get(ast.name));
    },
    VariableDeclaration: function (ast, code, varMap) {
        code.push(ast.kind);
        ast.declarations.forEach(function (decl, index) {
            code.push(index == 0 ? ' ' : ', ');
            process(decl.id, code, varMap);
            if(decl.init) {
                code.push(' = ');
                process(decl.init, code, varMap);
            }
        });
        code.push(terminator);
    },
    AssignmentExpression: function (ast, code, varMap) {
        process(ast.left, code, varMap);
        code.push(' = ');
        process(ast.right, code, varMap);
    },
    UnaryExpression: function (ast, code, varMap) {
        var unary = unaries[ast.operator];
        if(unary != null) {
            code.push(ns, unary, '(');
            process(ast.argument, code, varMap);
            code.push(')');
        } else {
            log.error("unknown unary operator " + ast.operator);
        }
    },
    BinaryExpression: function (ast, code, varMap) {
        var binary = binaries[ast.operator];
        if(binary != null) {
            code.push(ns, binary, '(');
            process(ast.left, code, varMap);
            code.push(', ');
            process(ast.right, code, varMap);
            code.push(')');
        } else {
            log.error("unknown binary operator " + ast.operator);
        }
    },
    UpdateExpression: function (ast, code, varMap) {
        var update = updaters[ast.operator];
        if(update != null) {
            if(ast.prefix) {
                code.push('(');
                process(ast.argument, code, varMap);
                code.push(' = ', ns, update, '(');
                process(ast.argument, code, varMap);
                code.push('))');
            } else {
                code.push('(function(){ var $ret = ');
                process(ast.argument, code, varMap);
                code.push(';');
                process(ast.argument, code, varMap);
                code.push(' = ', ns, update, '(');
                process(ast.argument, code, varMap);
                code.push('); return $ret;}())');                
            }
        } else {
            log.error("unknown update operator " + ast.operator);
        }
    },
    ObjectExpression: function (ast, code, varMap) {
        code.push(ns, 'unit(new ', ns, 'DynamicObject({');
        ast.properties.forEach(function (property, index) {
            if(index > 0) {
                code.push(', ');
            }
            
            if(property.kind == 'init') {
                code.push(_getKey(property.key), ': ');
                process(property.value, code, varMap);
            } else {
                log.error("unknown property kind " + property.kind);
            }
        });
        code.push('}))');
    },
    ArrayExpression: function (ast, code, varMap) {
        code.push(ns, 'unit(new ', ns, 'DynamicArray([');
        ast.elements.forEach(function (element, index) {
            if(index > 0) {
                code.push(', ');
            }
            process(element, code, varMap);
        });
        code.push(']))');
    },
    MemberExpression: function (ast, code, varMap) {
        code.push(ns, 'getMember(');
        process(ast.object, code, varMap);
        code.push(', ');
        if (ast.computed) {
            process(ast.property, code, varMap);
        } else {
            code.push(ns, 'unit(\'', ast.property.name, '\')');
        }
        code.push(').val');
    },
    IfStatement: function (ast, code, varMap) {
    
        var branchMap = varMap.branch();
    
        varMap.forEach(function (key, value) {
            var name = varMap.get(key);
            var alias = branchMap.get(key);
            code.push('var ', alias, ' = ', name, ', ', name, ' = new ', ns, 'Promise()', terminator);
        });
    
        process(ast.test, code, branchMap);
        code.push('.kept(function(data){\nif(data)');
        process(ast.consequent, code, branchMap);
        if(ast.alternate) {
            code.push('else ');
            process(ast.alternate, code, branchMap);
        }
        
        varMap.forEach(function (key, value) {
            var name = varMap.get(key);
            var alias = branchMap.get(key);
            code.push(alias, '.bindTo(', name, ')', terminator);
        });
     
        code.push('}).broken(', ns, 'errorFunc(', ns, 'error.conditionalBrokenPromise))', terminator);
    },
    WhileStatement: function (ast, code, varMap) {
        var branchMap = varMap.branch();

        varMap.forEach(function (key, value) {
            var name = varMap.get(key);
            var alias = branchMap.get(key);
            code.push('var ', alias, ' = ', name, ', ', name, ' = new ', ns, 'Promise()', terminator);
        });

        code.push('(function loop() {\n');

        process(ast.test, code, branchMap);
        code.push('.kept(function(data){\nif(data) {');
        process(ast.body, code, branchMap);
        code.push('loop()', terminator);
        
        code.push('} else {');
        varMap.forEach(function (key, value) {
            var name = varMap.get(key);
            var alias = branchMap.get(key);
            code.push(alias, '.bindTo(', name, ')', terminator);
        });
        code.push('} ');

        code.push('}).broken(', ns, 'errorFunc(', ns, 'error.conditionalBrokenPromise))', terminator);

        code.push('})()', terminator);
    },
    FunctionExpression: function (ast, code, varMap) {
        var scopeMap = varMap.scope();

        code.push('promise.unit(function ');
        process(ast.id, code, scopeMap);
        code.push('(');
        
        ast.params.forEach(function (param, index) {
            if(index > 0) {
                code.push(', ');
            }
            
            process(param, code, scopeMap);
        });

        code.push(')');
        process(ast.body, code, scopeMap);
        code.push(')');
    },
    CallExpression: function (ast, code, varMap) {
        code.push('(function () {\n', 'var args = arguments', terminator);

        process(ast.callee, code, varMap);
        code.push('.thenData(function (data) {\n', 'data.apply(');
        
        // execution context
        if(ast.callee.type == 'MemberExpression') {
            process(ast.callee.object, code, varMap);
        } else {
            code.push('null');
        }
        
        code.push(', args)', terminator, '})', terminator);

        code.push('})(');

        ast.arguments.forEach(function (arg, index) {
            if(index > 0) {
                code.push(', ');
            }
            
            process(arg, code, varMap);
        });
        code.push(')');
    }
}