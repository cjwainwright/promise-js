/////////////////////////////////////////////////////
// Collection class
/////////////////////////////////////////////////////

function Collection() {
    this._queue = [];
}

extend(Collection.prototype, {
    _currentVersion: function () {
    },
    _increaseVersion: function () {
    },
    _get: function (index, version) {
    },
    _set: function (index, value) {
    },
    _delete: function (index) {
    },
    get: function (index) {
        // make a promise of the return value
        var ret = new Promise();
        var that = this;
        this._enqueue(function () {
            var version = that._currentVersion(); // needs to use version of values at moment of 'call'
            index.kept(function (i) {
                var val = that._get(i, version);
                // bind the retrieved promise to the returned promise, or null if there is no value specified
                if (val == null) {
                    ret.setData(val);
                } else {
                    val.bindTo(ret);
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
            index.kept(function (i) {
                that._set(i, value);
                that._increaseVersion();
                that._dequeue(); // can only be dequeued once the index is resolved
            }).broken(function (){
                throw new Error("Can't use broken promise as array index");
            });
        });
        return value;
    },
    'delete': function (index, value) {
        var that = this;
        this._enqueue(function () {
            index.kept(function (i) {
                that._delete(i);
                that._increaseVersion();
                that._dequeue(); // can only be dequeued once the index is resolved
            }).broken(function (){
                throw new Error("Can't use broken promise as array index");
            });
        });
        return value;
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
