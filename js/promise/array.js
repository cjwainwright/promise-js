/////////////////////////////////////////////////////
// DynamicArray class
/////////////////////////////////////////////////////

function DynamicArray(init) {
    DynamicArray.Parent.call(this);
    this.currents = init || [];
}

derive(DynamicArray, Collection);

extend(DynamicArray.prototype, {
    _currentVersion: function () {
        return this.currents.slice();
    },
    _increaseVersion: function () {
    },
    _get: function (index, version) {
        return version[index];
    },
    _set: function (index, value) {
        this.currents[index] = value;
    },
    _delete: function (index) {
        delete this.currents[index];
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
