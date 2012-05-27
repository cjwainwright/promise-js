
/////////////////////////////////////////////////////
// TODO - can we make the variable/promise proxy all method calls to the underlying value data

function Variable(current) {
    this.current = current;
}

Variable.prototype = {
    assign: function (promise) {
        return this.current = promise;
    }
}; 

/////////////////////////////////////////////////////

exports.Variable = Variable;

/////////////////////////////////////////////////////
