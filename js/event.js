/////////////////////////////////////////////////////

function Event() {
    this._listeners = [];
}

Event.prototype = {
    add: function (listener) {
        this._listeners.push(listener);
    },
    notify: function (context, args) {
        var count = this._listeners.length;
        for (var i = 0; i < count; i++) {
            this._listeners[i].apply(context, args);
        }
    },
    clear: function () {
        this._listeners = [];
    }
};

/////////////////////////////////////////////////////
