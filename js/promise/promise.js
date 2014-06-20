/////////////////////////////////////////////////////
// Promise class
/////////////////////////////////////////////////////

var waiting = "waiting",
    kept = "kept",
    broken = "broken";

/////////////////////////////////////////////////////

function Promise() {
    this.state = waiting;
    this.data;
    this._onkept = new Event();
    this._onbroken = new Event();
}

extend(Promise.prototype, {
    kept: function (callback) {
        if (this.state == waiting) {
            this._onkept.add(callback);
        } else if (this.state == kept) {
            callback(this.data);
        }
        return this;
    },
    broken: function (callback) {
        if (this.state == waiting) {
            this._onbroken.add(callback);
        } else if (this.state == broken) {
            callback();
        }
        return this;
    },
    setBroken: function () {
        if (this.state != waiting) {
            errorFunc(error.promiseBreakingAlreadyResolved)();
        }
        this.state = broken;
        this._onbroken.notify(this);
        this._onkept.clear();
        this._onbroken.clear();
    },
    setData: function (data) {
        if (this.state != waiting) {
            errorFunc(error.promiseKeepingAlreadyResolved)();
        }
        this.data = data;
        this.state = kept;
        this._onkept.notify(this, [this.data]);
        this._onkept.clear();
        this._onbroken.clear();
    },
    bindTo: function (promise) {
        this.kept(function (data) {
            promise.setData(data);
        }).broken(function () {
            promise.setBroken();
        });
    },
    then: function (action) {
        // equiv of Monad bind operation, action must return a promise
        var ret = new Promise();
        this.kept(function (data) {
            action(data).bindTo(ret);
        }).broken(function () {
            ret.setBroken();
        });
        return ret;
    },
    thenData: function (action) {
        // action must return a value
        // equivalent of:
        // return this.then(function (data) { return unit(action(data)); });
        var ret = new Promise();
        this.kept(function (data) {
            ret.setData(action(data));
        }).broken(function () {
            ret.setBroken();
        });
        return ret;
    }
});

/////////////////////////////////////////////////////

function unit(data) {
    var promise = new Promise();
    promise.setData(data);
    return promise;
}

function all(args) {
    // returns a promise that is either kept (with the data of args) when all args have been kept, or broken when any of args is broken
    var ret = new Promise();
    
    function onKept() {
        // don't care about subsequent events coming in
        if (ret.state != waiting) {
            return;
        }

        // see if all promises have been kept
        var allKept = true;
        for (var j = 0; j < args.length; j++) {
            if (args[j].state != kept) {
                allKept = false;
                break;
            }
        }

        // merge the data and pass to the returned promise
        if (allKept) {
            var argsData = [];
            for (var i = 0; i < args.length; i++) {
                argsData[i] = args[i].data;
            }
            ret.setData(argsData);
        }
    }
    
    function onBroken() {
        // don't care about subsequent events coming in
        if (ret.state != waiting) {
            return;
        }
        
        ret.setBroken();
    }
    
    if (args.length > 0) {
        for (var i = 0; i < args.length; i++) {
            args[i].kept(onKept).broken(onBroken);
        }
    } else {
        onKept();
    }
    
    return ret;
}

function fmap(f) {
    // maps a function to it's promise based equivalent. 
    // fmap(f) is a function that returns a promise, it waits for all it's arguments to be resolved before using them to evaluate f and resolving the returned promise with the result.
    return function () {
        return all(arguments).thenData(function (data) {
            return f.apply(null, data);
        });
    };
}

/////////////////////////////////////////////////////

exports.Promise = Promise;
exports.unit = unit;
exports.fmap = fmap;

/////////////////////////////////////////////////////
