/*!
Copyright (c) 2012, C J Wainwright, http://cjwainwright.co.uk

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (exports, parse, log) {

    exports.exportTo = function (o) {
        for (var key in exports) {
            if (exports.hasOwnProperty(key)) {
                o[key] = exports[key];
            }
        }
    };
    
var process = function(ast, code) {
    if(ast != null) {
        var processor = processors[ast.type];
        if(processor) {
            processor(ast, code);
        } else {
            code.push('/* unknown type ', ast.type, ' */')
            log.error("unknown type " + ast.type);
        }
    }
};

var ns = 'promise.',
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
    Program: function (ast, code) {
        ast.body.forEach(function (stmt) {
            process(stmt, code);
        });
    },
    EmptyStatement: function (ast, code) {
        code.push(terminator);
    },
    BlockStatement: function (ast, code) {
        code.push('{\n');
        ast.body.forEach(function (stmt) {
            process(stmt, code);
        });
        code.push('}');
    },
    ExpressionStatement: function (ast, code) {
        process(ast.expression, code);
        code.push(terminator);
    },
    ReturnStatement: function (ast, code) {
        code.push('return ');
        if(ast.argument) {
            process(ast.argument, code);
        } else {
            code.push(ns, 'unit()')
        }
        code.push(terminator);
    },
    Literal: function (ast, code) {
        code.push(ns, 'unit(', ast.raw, ')');
    },
    Identifier: function (ast, code) {
        code.push(ast.name);
    },
    VariableDeclaration: function (ast, code) {
        code.push(ast.kind);
        ast.declarations.forEach(function (decl, index) {
            code.push(index == 0 ? ' ' : ', ');
            process(decl.id, code);
            if(decl.init) {
                code.push(' = ');
                process(decl.init, code);
            }
        });
        code.push(terminator);
    },
    AssignmentExpression: function (ast, code) {
        process(ast.left, code);
        code.push(' = ');
        process(ast.right, code);
    },
    UnaryExpression: function (ast, code) {
        var unary = unaries[ast.operator];
        if(unary != null) {
            code.push(ns, unary, '(');
            process(ast.argument, code);
            code.push(')');
        } else {
            log.error("unknown unary operator " + ast.operator);
        }
    },
    BinaryExpression: function (ast, code) {
        var binary = binaries[ast.operator];
        if(binary != null) {
            code.push(ns, binary, '(');
            process(ast.left, code);
            code.push(', ');
            process(ast.right, code);
            code.push(')');
        } else {
            log.error("unknown binary operator " + ast.operator);
        }
    },
    UpdateExpression: function (ast, code) {
        var update = updaters[ast.operator];
        if(update != null) {
            if(ast.prefix) {
                code.push('(');
                process(ast.argument, code);
                code.push(' = ', ns, update, '(');
                process(ast.argument, code);
                code.push('))');
            } else {
                code.push('(function(){ var $ret = ');
                process(ast.argument, code);
                code.push(';');
                process(ast.argument, code);
                code.push(' = ', ns, update, '(');
                process(ast.argument, code);
                code.push('); return $ret;}())');                
            }
        } else {
            log.error("unknown update operator " + ast.operator);
        }
    },
    ObjectExpression: function (ast, code) {
        code.push(ns, 'unit(new ', ns, 'DynamicObject({');
        ast.properties.forEach(function (property, index) {
            if(index > 0) {
                code.push(', ');
            }
            
            if(property.kind == 'init') {
                code.push(_getKey(property.key), ': ');
                process(property.value, code);
            } else {
                log.error("unknown property kind " + property.kind);
            }
        });
        code.push('}))');
    },
    ArrayExpression: function (ast, code) {
        code.push(ns, 'unit(new ', ns, 'DynamicArray([');
        ast.elements.forEach(function (element, index) {
            if(index > 0) {
                code.push(', ');
            }
            process(element, code);
        });
        code.push(']))');
    },
    MemberExpression: function (ast, code) {
        code.push(ns, 'getMember(');
        process(ast.object, code);
        code.push(', ');
        if (ast.computed) {
            process(ast.property, code);
        } else {
            code.push(ns, 'unit(\'', ast.property.name, '\')');
        }
        code.push(').val');
    }
}

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

    // process each statement inside the function body to avoid duplicate block statement inside resulting function
    functionDecl.body.body.forEach(function (stmt) {
        process(stmt, code);
    });

    args.push(code.join(''));
    
    return Function.apply(null, args);
}

function map(input) {
    var code = [];
    var ast = parse(input, code);
    process(ast, code);
    return code.join('');
}

exports.map = map;
exports.compile = compile;


})(
    typeof exports === 'undefined' ? (promisify = {}) : exports,
    typeof esprima === 'undefined' ? function(){throw new Error("No parsing library available"); } : esprima.parse,
    console || { error: function(){} }
);
