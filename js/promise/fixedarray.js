/////////////////////////////////////////////////////
// DEPRECATED - use DynamicArray instead
/////////////////////////////////////////////////////

function FixedArray(length) {
    this.currents = new Array(length);
}

FixedArray.prototype = {
    get: function (index) {
        // make a promise of the return value, needs to use copy of values at moment of call
        var ret = new Promise();
        var currents = this.currents.slice(); 
        index.kept(function(i){
            // bind the retrieved promise to the returned promise
            if (currents[i] == null) {
                ret.setData(null);
            } else {
                currents[i].bindTo(ret);
            }
        }).broken(function () {
            ret.setBroken();
        });
        return ret;
    },
    set: function (index, value) {
        // make new promises, keeping references to both new and old
        var currents = this.currents.slice();
        var i, length = this.currents.length;
        for (i = 0; i < length; i++) {
            this.currents[i] = new Promise();
        }
        var currentsNew = this.currents.slice();
        
        index.kept(function(data){
            // update all the promises we made
            for (i = 0; i <  length; i++) {
                if (i == data) {
                    value.bindTo(currentsNew[i]);
                } else {
                    if (currents[i] == null) {
                        currentsNew[i].setData(null);
                    } else {
                        currents[i].bindTo(currentsNew[i]);
                    }
                }
            }
        }).broken(errorFunc(error.collectionIndexBrokenPromise));
        return value;
    }
};
