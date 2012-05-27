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
