/////////////////////////////////////////////////////
// TODO -
// Clarify when we throw exceptions and when we set values as broken
// when apply-ing functions what context should we be using
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

Promise.prototype = {
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
            callback(this.error);
        }
        return this;
    },
    setBroken: function () {
        if (this.state != waiting) {
            throw new Error("Attempting to break a resolved promise");
        }
        this.state = broken;
        this._onbroken.notify(this);
        this._onkept.clear();
        this._onbroken.clear();
    },
    setData: function (data) {
        if (this.state != waiting) {
            throw new Error("Attempting to keep a resolved promise");
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
    }
};

/////////////////////////////////////////////////////

function fmap(f) {
    return function () {
        var ret = new Promise();
        var args = [].slice.call(arguments);
        
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
                ret.setData(f.apply(null, argsData))
            }
        }
        
        function onBroken() {
            // don't care about subsequent events coming in
            if (ret.state != waiting) {
                return;
            }
            
            ret.setBroken();
        }
        
        for (var i = 0; i < args.length; i++) {
            args[i].kept(onKept).broken(onBroken);
        }
        
        return ret;
    };
}

/////////////////////////////////////////////////////

exports.Promise = Promise;
exports.fmap = fmap;

/////////////////////////////////////////////////////
