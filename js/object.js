/////////////////////////////////////////////////////
// DynamicObject class
/////////////////////////////////////////////////////

function DynamicObject(init) {
    DynamicObject.Parent.call(this);
    this._currents = init || {};
    this._snapshot = null;
}

derive(DynamicObject, Collection);

extend(DynamicObject.prototype, {
    _currentVersion: function () {
        if (this._snapshot == null) {
            this._snapshot = {};
            for (var key in this._currents) {
                this._snapshot[key] = this._currents[key];
            }
        }
        return this._snapshot;
    },
    _increaseVersion: function () {
        this._snapshot = null;
    },
    _get: function (index, version) {
        return version[index];
    },
    _set: function (index, value) {
        this._currents[index] = value;
    },
    _delete: function (index) {
        delete this._currents[index];
    }
});

/////////////////////////////////////////////////////

exports.DynamicObject = DynamicObject;

/////////////////////////////////////////////////////
