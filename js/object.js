
/////////////////////////////////////////////////////

function DynamicObject() {
    DynamicObject.Parent.call(this);
    this.currents = {};
}

derive(DynamicObject, Collection);

DynamicObject.prototype._currentsCopy = function () {
    var currents = {};
    for (var key in this.currents) {
        currents[key] = this.currents[key];
    }
    return currents;
};

/////////////////////////////////////////////////////

exports.DynamicObject = DynamicObject;

/////////////////////////////////////////////////////
