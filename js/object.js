/////////////////////////////////////////////////////
// DynamicObject class
/////////////////////////////////////////////////////

function DynamicObject(init) {
    DynamicObject.Parent.call(this);
    this.currents = init || {};
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
