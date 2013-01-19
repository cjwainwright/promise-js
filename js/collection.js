/////////////////////////////////////////////////////
// Collection class
/////////////////////////////////////////////////////

function Collection() {
    this._queue = [];
}

extend(Collection.prototype, {
    get: function (index) {
        // make a promise of the return value
        var ret = new Promise();
        var that = this;
        this._enqueue(function () {
            // needs to use copy of values at moment of 'call'
            var currents = that._currentsCopy(); // TODO - performance: if index already ready, don't need to create a copy, just use the currents directly
            index.kept(function(i){
                // bind the retrieved promise to the returned promise
                if (currents[i] == null) {
                    ret.setData(currents[i]);
                } else {
                    currents[i].bindTo(ret);
                }
            }).broken(function (){
                ret.setBroken();
            });
            that._dequeue(); // can be dequeued immediately
        });

        return ret;
    },
    set: function (index, value) {
        var that = this;
        this._enqueue(function () {
            index.kept(function(i){
                that.currents[i] = value;
                that._dequeue(); // can only be dequeued once the index is resolved
            }).broken(function (){
                throw new Error("Can't use broken promise as array index");
            });
        })
        return value;
    },
    'delete': function (index, value) {
        var that = this;
        this._enqueue(function () {
            index.kept(function (i){
                delete that.currents[i];
                that._dequeue(); // can only be dequeued once the index is resolved
            }).broken(function (){
                throw new Error("Can't use broken promise as array index");
            });
        })
        return value;
    },
    _currentsCopy: function () {
    },
    _enqueue: function (fn) {
        this._queue.push(fn);
        if (this._queue.length == 1) {
            this._queue[0]();
        }
    },
    _dequeue: function () {
        if (this._queue.length == 0) {
            throw new Error("Nothing to dequeue");
        } else {
            this._queue.shift();
            if (this._queue.length > 0) {
                this._queue[0]();
            }
        }
    }
});

/////////////////////////////////////////////////////

function get(collection, index) {
    var ret = new Promise();
    collection.kept(function (data){
        data.get(index).bindTo(ret);
    }).broken(function () {
        ret.setBroken();
    });
    return ret;
}

function set(collection, index, value) {
    collection.kept(function (data){
        data.set(index, value);
    }).broken(function () {
        throw new Error('Trying to set a value on a broken promise');
    });
    return value;
}

function getMember(collection, index) {
    var member = {
        get val() {
            var ret = new Promise();
            collection.kept(function (data){
                data.get(index).bindTo(ret);
            }).broken(function () {
                ret.setBroken();
            });
            return ret;
        },
        set val(value) {
            var ret = new Promise();
            collection.kept(function (data){
                data.set(index, value).bindTo(ret);
            }).broken(function () {
                ret.setBroken();
            });
            return ret;
        }
    };

    return member;
}

/////////////////////////////////////////////////////

exports.getMember = getMember;
exports.get = get;
exports.set = set;

/////////////////////////////////////////////////////
