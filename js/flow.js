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
