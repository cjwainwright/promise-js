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

(function (exports) {

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

/////////////////////////////////////////////////////
// Promise class
/////////////////////////////////////////////////////

var waiting = "waiting",
    kept = "kept",
    broken = "broken";

/////////////////////////////////////////////////////

function Promise() {
    this.state = waiting;
    this.data;
    this._onkept = new Event();
    this._onbroken = new Event();
}

extend(Promise.prototype, {
    kept: function (callback) {
        if (this.state == waiting) {
            this._onkept.add(callback);
        } else if (this.state == kept) {
            callback(this.data);
        }
        return this;
    },
    broken: function (callback) {
        if (this.state == waiting) {
            this._onbroken.add(callback);
        } else if (this.state == broken) {
            callback();
        }
        return this;
    },
    setBroken: function () {
        if (this.state != waiting) {
            throw new Error("Attempting to break a resolved promise");
        }
        this.state = broken;
        this._onbroken.notify(this);
        this._onkept.clear();
        this._onbroken.clear();
    },
    setData: function (data) {
        if (this.state != waiting) {
            throw new Error("Attempting to keep a resolved promise");
        }
        this.data = data;
        this.state = kept;
        this._onkept.notify(this, [this.data]);
        this._onkept.clear();
        this._onbroken.clear();
    },
    bindTo: function (promise) {
        this.kept(function (data) {
            promise.setData(data);
        }).broken(function () {
            promise.setBroken();
        });
    },
    then: function (action) {
        // equiv of Monad bind operation, action must return a promise
        var ret = new Promise();
        this.kept(function (data) {
            action(data).bindTo(ret);
        }).broken(function () {
            ret.setBroken();
        });
        return ret;
    },
    thenData: function (action) {
        // action must return a value
        // equivalent of:
        // return this.then(function (data) { return unit(action(data)); });
        var ret = new Promise();
        this.kept(function (data) {
            ret.setData(action(data));
        }).broken(function () {
            ret.setBroken();
        });
        return ret;
    }
});

/////////////////////////////////////////////////////

function unit(data) {
    var promise = new Promise();
    promise.setData(data);
    return promise;
}

function all(args) {
    // returns a promise that is either kept (with the data of args) when all args have been kept, or broken when any of args is broken
    var ret = new Promise();
    
    function onKept() {
        // don't care about subsequent events coming in
        if (ret.state != waiting) {
            return;
        }

        // see if all promises have been kept
        var allKept = true;
        for (var j = 0; j < args.length; j++) {
            if (args[j].state != kept) {
                allKept = false;
                break;
            }
        }

        // merge the data and pass to the returned promise
        if (allKept) {
            var argsData = [];
            for (var i = 0; i < args.length; i++) {
                argsData[i] = args[i].data;
            }
            ret.setData(argsData);
        }
    }
    
    function onBroken() {
        // don't care about subsequent events coming in
        if (ret.state != waiting) {
            return;
        }
        
        ret.setBroken();
    }
    
    if (args.length > 0) {
        for (var i = 0; i < args.length; i++) {
            args[i].kept(onKept).broken(onBroken);
        }
    } else {
        onKept();
    }
    
    return ret;
}

// TODO - really fmap should be using the transcompiler building appropriate code out of function source code
function fmap(f) {
    return function () {
        return all(arguments).thenData(function (data) {
            return f.apply(null, data);
        });
    };
}

/////////////////////////////////////////////////////

exports.Promise = Promise;
exports.unit = unit;
exports.fmap = fmap;

/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// Variable class
/////////////////////////////////////////////////////

function Variable(current) {
    this.current = current;
}

extend(Variable.prototype, {
    assign: function (promise) {
        return this.current = promise;
    },
    assignPostfix: function (promise) {
        var original = this.current;
        this.current = promise;
        return original;
    }
}); 

/////////////////////////////////////////////////////

exports.Variable = Variable;

/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// Collection class
/////////////////////////////////////////////////////

function Collection() {
    this._queue = [];
}

extend(Collection.prototype, {
    get: function (index) {
        // make a promise of the return value
        var ret = new Promise();
        var that = this;
        this._enqueue(function () {
            // needs to use copy of values at moment of 'call'
            var currents = that._currentsCopy(); // TODO - performance: if index already ready, don't need to create a copy, just use the currents directly
            index.kept(function(i){
                // bind the retrieved promise to the returned promise
                if (currents[i] == null) {
                    ret.setData(currents[i]);
                } else {
                    currents[i].bindTo(ret);
                }
            }).broken(function (){
                ret.setBroken();
            });
            that._dequeue(); // can be dequeued immediately
        });
            
        return ret;
    },
    set: function (index, value) {
        var that = this;
        this._enqueue(function () {
            index.kept(function(i){
                that.currents[i] = value;
                that._dequeue(); // can only be dequeued once the index is resolved
            }).broken(function (){
                throw new Error("Can't use broken promise as array index");
            });
        })
        return value;
    },
    'delete': function (index, value) {
        var that = this;
        this._enqueue(function () {
            index.kept(function (i){
                delete that.currents[i];
                that._dequeue(); // can only be dequeued once the index is resolved
            }).broken(function (){
                throw new Error("Can't use broken promise as array index");
            });
        })
        return value;
    },
    _currentsCopy: function () {
    },
    _enqueue: function (fn) {
        this._queue.push(fn);
        if (this._queue.length == 1) {
            this._queue[0]();
        }
    },
    _dequeue: function () {
        if (this._queue.length == 0) {
            throw new Error("Nothing to dequeue");
        } else {
            this._queue.shift();
            if (this._queue.length > 0) {
                this._queue[0]();
            }
        }
    }
});

/////////////////////////////////////////////////////

function get(collection, index) {
    var ret = new Promise();
    collection.kept(function (data){
        data.get(index).bindTo(ret);
    }).broken(function () {
        ret.setBroken();
    });
    return ret;
}

function set(collection, index, value) {
    collection.kept(function (data){
        data.set(index, value);
    }).broken(function () {
        throw new Error('Trying to set a value on a broken promise');
    });
    return value;
}

/////////////////////////////////////////////////////

exports.get = get;
exports.set = set;

/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// DynamicArray class
/////////////////////////////////////////////////////

function DynamicArray() {
    DynamicArray.Parent.call(this);
    this.currents = [];
}

derive(DynamicArray, Collection);

extend(DynamicArray.prototype, {
    _currentsCopy: function () {
        return this.currents.slice();
    },
    length: function () {
        // make a promise of the return value
        var ret = new Promise();
        var that = this;
        this._enqueue(function () {
            // needs to use copy of values at moment of 'call'
            ret.setData(that.currents.length);
            that._dequeue(); // can be dequeued immediately
        });
        return ret;
    }
});

/////////////////////////////////////////////////////

function length(array) {
    var ret = new Promise();
    array.kept(function (data){
        data.length().bindTo(ret);
    }).broken(function () {
        ret.setBroken();
    });
    return ret;
}

/////////////////////////////////////////////////////

exports.DynamicArray = DynamicArray;
exports.length = length;

/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// DynamicObject class
/////////////////////////////////////////////////////

function DynamicObject() {
    DynamicObject.Parent.call(this);
    this.currents = {};
}

derive(DynamicObject, Collection);

extend(DynamicObject.prototype, {
    _currentsCopy: function () {
        var currents = {};
        for (var key in this.currents) {
            currents[key] = this.currents[key];
        }
        return currents;
    }
});

/////////////////////////////////////////////////////

exports.DynamicObject = DynamicObject;

/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// Comparison
/////////////////////////////////////////////////////

var eq = fmap(function (u, v) {
    return u == v;
});

var neq = fmap(function (u, v) {
    return u != v;
});

var lt = fmap(function (u, v) {
    return u < v;
});

var lteq = fmap(function (u, v) {
    return u <= v;
});

var gt = fmap(function (u, v) {
    return u > v;
});

var gteq = fmap(function (u, v) {
    return u >= v;
});

/////////////////////////////////////////////////////

exports.eq = eq;
exports.neq = neq;
exports.lt = lt;
exports.lteq = lteq;
exports.gt = gt;
exports.gteq = gteq;

/////////////////////////////////////////////////////
// Arithmetic
/////////////////////////////////////////////////////

var add = fmap(function () {
    var ret = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        ret += arguments[i];
    }
    return ret;
});

var mult = fmap(function () {
    var ret = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        ret *= arguments[i];
    }
    return ret;
});

/////////////////////////////////////////////////////

exports.add = add;
exports.mult = mult;

/////////////////////////////////////////////////////
// Unary
/////////////////////////////////////////////////////

var not = fmap(function (a) {
    return !a;
});

var inc = fmap(function (a) {
    return ++a;
});

var dec = fmap(function (a) {
    return --a;
});

/////////////////////////////////////////////////////

exports.not = not;
exports.inc = inc;
exports.dec = dec;

/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// Flow functions
/////////////////////////////////////////////////////

function branchNow(condition, vars, map, funcs) {
    var varsAllBranches = [];
    var varsBranch;
    for (var n = 0; n < funcs.length; n++) {
        // create a version of the variables for this function
        varsBranch = varsAllBranches[n] = [];
        for (var i = 0; i < vars.length; i++) {
            varsBranch[i] = new Variable(vars[i].current);
        }
        funcs[n].apply(null, varsBranch);
    }
    
    // assign a promise to each variable in, this will be resolved by the condition to be the appropriate branch variable
    for (var i = 0; i < vars.length; i++) {
        vars[i].assign(new Promise());
    }
    
    condition.kept(function (data) {
        // bind correct branch vars back to vars
        varsBranch = varsAllBranches[map(data)];
        for (var i = 0; i < vars.length; i++) {
            varsBranch[i].current.bindTo(vars[i].current);
        }
    }).broken(function () {
        throw new Error("Can't use broken promise as predicate");
    });
}

/////////////////////////////////////////////////////

function ifelseNow(predicate, vars, trueFunc, falseFunc) {
    branchNow(predicate, vars, function (bool) { return bool ? 1 : 0; }, [falseFunc, trueFunc]);
}

/////////////////////////////////////////////////////

function ifNow(predicate, vars, trueFunc) {
    branchNow(predicate, vars, function (bool) { return bool ? 1 : 0; }, [function(){}, trueFunc]);
}

/////////////////////////////////////////////////////

function switchNow(test, vars, cases, defaultCase) {
    var funcs = [];
    var index = {};
    var n = 0;
    funcs[n++] = defaultCase;
    for (var key in cases) {
        index[key] = n;
        funcs[n++] = cases[key];
    }
    branchNow(test, vars, function (key) { return index[key]; }, funcs);
}

/////////////////////////////////////////////////////

function branchLater(condition, vars, map, funcs) {
        // create a version of the variables for this function
    var varsBranch = [];
    for (var i = 0; i < vars.length; i++) {
        varsBranch[i] = new Variable(vars[i].current);
        vars[i].assign(new Promise());
    }
    
    condition.kept(function (data) {
        // bind correct branch vars back to vars
        funcs[map(data)].apply(null, varsBranch);

        for (var i = 0; i < vars.length; i++) {
            varsBranch[i].current.bindTo(vars[i].current);
        }
    }).broken(function () {
        throw new Error("Can't use broken promise as predicate");
    });
}

/////////////////////////////////////////////////////

function ifelseLater(predicate, vars, trueFunc, falseFunc) {
    branchLater(predicate, vars, function (bool) { return bool ? 1 : 0; }, [falseFunc, trueFunc]);
}

/////////////////////////////////////////////////////

function ifLater(predicate, vars, trueFunc) {
    branchLater(predicate, vars, function (bool) { return bool ? 1 : 0; }, [function(){}, trueFunc]);
}

/////////////////////////////////////////////////////

function switchLater(test, vars, cases, defaultCase) {
    var funcs = [];
    var index = {};
    var n = 0;
    funcs[n++] = defaultCase;
    for (var key in cases) {
        index[key] = n;
        funcs[n++] = cases[key];
    }
    branchLater(test, vars, function (key) { return index[key]; }, funcs);
}

/////////////////////////////////////////////////////

exports.ifelseNow = ifelseNow;
exports.ifNow = ifNow;
exports.switchNow = switchNow;

exports.ifelseLater = ifelseLater;
exports.ifLater = ifLater;
exports.switchLater = switchLater;

/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// Loop functions
/////////////////////////////////////////////////////

function loopWhile(conditionVars, conditionFunc, vars, func) {
    var i, allVarsIndex = 0;
    var varsBranch = [], 
        conditionVarsBranch = [],
        allVars = [],
        allVarsBranch = [];
        
    // create branch version of all unique variables
    // assign promises to current variables
    for (i = 0; i < conditionVars.length; i++) {
        conditionVarsBranch[i] = new Variable(conditionVars[i].current);
        conditionVars[i].assign(new Promise());

        // keep track of this in all variables
        conditionVars[i].allVarsIndex = allVarsIndex;
        allVars[allVarsIndex] = conditionVars[i];
        allVarsBranch[allVarsIndex] = conditionVarsBranch[i];
        allVarsIndex += 1;
    }
    
    for (i = 0; i < vars.length; i++) {
        if('allVarsIndex' in vars[i]) {
            varsBranch[i] = allVarsBranch[vars[i].allVarsIndex];
        } else {
            varsBranch[i] = new Variable(vars[i].current);
            vars[i].assign(new Promise());
            
            // keep track of this in all variables
            allVars[allVarsIndex] = vars[i];
            allVarsBranch[allVarsIndex] = varsBranch[i];
            allVarsIndex += 1;
        }
    }
    
    // tidy up
    for (i = 0; i < conditionVars.length; i++) {
        delete conditionVars[i].allVarsIndex;
    }
       
    function loop() {
        var condition = conditionFunc.apply(null, conditionVarsBranch);
        condition.kept(function (data) {
            if (data) {
                var breakOut = func.apply(null, varsBranch);
                if (breakOut == null) {
                    loop(); // TODO - ?kill the stack with setTimeout(loop, 0);
                } else {
                    breakOut.kept(function (data) {
                        if (!data) { // truthy values break out of the loop
                            loop();
                        } else {
                            for (var i = 0; i < allVars.length; i++) {
                                allVarsBranch[i].current.bindTo(allVars[i].current);
                            }
                        }
                    }).broken(function () {
                        throw new Error("Broken promise in loop break");
                    });
                }
            } else {
                // bind all vars back to originals
                for (var i = 0; i < allVars.length; i++) {
                    allVarsBranch[i].current.bindTo(allVars[i].current);
                }
            }
        }).broken(function () {
            throw new Error("Broken promise in a loop condition");
        });
    }
    loop();
}

/////////////////////////////////////////////////////

exports.loopWhile = loopWhile;

/////////////////////////////////////////////////////

/////////////////////////////////////////////////////
// Data provider functions
/////////////////////////////////////////////////////

function nowData(data) {
    var promise = new Promise();
    promise.setData(data);
    return promise;
}

function nowBreak() {
    var promise = new Promise();
    promise.setBroken();
    return promise;
}

function laterData(data, delay) {
    var promise = new Promise();
    setTimeout(function(){promise.setData(data);}, delay);
    return promise;
}

function laterBreak(delay) {
    var promise = new Promise();
    setTimeout(function(){promise.setBroken();}, delay);
    return promise;
}

function inputData(key, parser) {
    var ret = new Promise();
 
    var div = document.createElement('DIV');

    var input = document.createElement('INPUT');
    input.type = 'text';
    div.appendChild(input);

    var button = document.createElement('BUTTON');
    button.appendChild(document.createTextNode('>'));
    div.appendChild(button);

    var text = document.createTextNode('...');
    key.kept(function(data){
        text.data = data;
    }).broken(function(){
        text.data = '!!';
    });
    div.appendChild(text);
    
    document.body.appendChild(div);
    input.focus();
    
    button.addEventListener('click', function click() {
        ret.setData(parser ? parser(input.value) : input.value);
        input.disabled = true;
        button.disabled = true;
        button.removeEventListener('click', click);
    });
    return ret;
};

/////////////////////////////////////////////////////

exports.nowData = nowData;
exports.nowBreak = nowBreak;
exports.laterData = laterData;
exports.laterBreak = laterBreak;
exports.inputData = inputData;

/////////////////////////////////////////////////////


})(typeof exports === 'undefined' ? (promise = {}) : exports);

/* TODOs 
 * Clarify when we throw exceptions and when we set values as broken
 * When apply-ing functions what context should we be using
 * Can we make the variable/promise proxy all method calls to the underlying value data?
 */
