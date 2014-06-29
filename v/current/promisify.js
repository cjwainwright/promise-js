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
    
/////////////////////////////////////////////////////
// Utility functions
/////////////////////////////////////////////////////

var slice = Array.prototype.slice;

/////////////////////////////////////////////////////

if(typeof(Object.create) !== 'function')
{
    Object.create = function(o){
        function F(){}
        F.prototype = o;
        return new F();
    };
}

/////////////////////////////////////////////////////

function derive(Child, Parent) {
    Child.prototype = Object.create(Parent.prototype);
    Child.prototype.constructor = Child;
    Child.Parent = Parent;
}

/////////////////////////////////////////////////////

function extend(target) {
    var sources = slice.call(arguments, 1);
    for (var i = 0, length = sources.length; i < length; i++) {
        var source = sources[i];
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }
}

/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// Event class
/////////////////////////////////////////////////////

function Event() {
    this._listeners = [];
}

extend(Event.prototype, {
    add: function (listener) {
        this._listeners.push(listener);
    },
    notify: function (context, args) {
        var count = this._listeners.length;
        for (var i = 0; i < count; i++) {
            this._listeners[i].apply(context, args);
        }
    },
    clear: function () {
        this._listeners = [];
    }
});

/////////////////////////////////////////////////////

function VarMap() {
    this._map = {};
    this._mapInv = {};
    this._reserved = {};
    
    this._onCreate = new Event();
    this._onBeforeGet = new Event();
    this._onReserve = new Event();
}

VarMap.prototype._create = function (key, value) {
    this._map[key] = value;
    this._mapInv[value] = key;
    this._onCreate.notify(this, [key, value]);
};

VarMap.prototype.get = function (key) {
    this._onBeforeGet.notify(this, [key]);

    var map = this._map;
    var mapInv = this._mapInv;
    
    if(map.hasOwnProperty(key)) {
        return map[key];
    }
    
    var value = key;
    while(mapInv.hasOwnProperty(value) || this._reserved.hasOwnProperty(value)) {
        value = '$' + value;
    }
    
    this._create(key, value);
    return value;
};

VarMap.prototype.forEach = function (fn) {
    var map = this._map;
    for (var key in map) {
        if(map.hasOwnProperty(key)) {
            fn(key, map[key]);
        }
    }
};

VarMap.prototype.reserve = function (key) {
    this._reserved[key] = true;
    this._onReserve.notify(this, [key]);
};

VarMap.prototype.branch = function () {
    // redefine variables to new, non-clashing values
    var map = new VarMap();
    
    // copy across all reserved values (note this allows multiple branches require new values to not clash with all previous levels)
    Object.keys(this._reserved).forEach(map.reserve.bind(map));
    
    // copy all mapped variable values to reserved values
    this.forEach(function (key, value) {
        map.reserve(value);
    });
    
    // Ensure newly created variables in branch map create variables in source map... 
    var that = this;
    map._onBeforeGet.add(function (key) {
        that.get(key);
    });

    // ...and thus reserve value in branch map
    this._onCreate.add(function (key, value) {
        map.reserve(value);
    });

    // Ensure newly reserved variables get reserved in branch map too
    this._onReserve.add(function (key) {
        map.reserve(key);
    });
    
    return map;
};

VarMap.prototype.scope = function () {
    // create a new variable map for use within a new scope
    // variables created in this map will not be created in the outer map
    var map = new VarMap();
    
    // should reserve same values as the outer map
    Object.keys(this._reserved).forEach(map.reserve.bind(map));
    
    // should map all same values as the outer map
    this.forEach(function (key, value) {
        map._create(key, value);
    });
    
    return map;
};

exports.VarMap = VarMap;

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


})(
    typeof exports === 'undefined' ? (promisify = {}) : exports,
    typeof esprima === 'undefined' ? function(){throw new Error("No parsing library available"); } : esprima.parse,
    console || { error: function(){} }
);
