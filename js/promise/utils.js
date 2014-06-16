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
