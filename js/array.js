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
