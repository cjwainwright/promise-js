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
