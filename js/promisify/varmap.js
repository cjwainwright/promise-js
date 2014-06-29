function VarMap() {
    this._map = {};
    this._mapInv = {};
    this._reserved = {};
    
    this._onCreate = new Event();
    this._onBeforeGet = new Event();
    this._onReserve = new Event();
}

VarMap.prototype._create = function (key, value) {
    this._map[key] = value;
    this._mapInv[value] = key;
    this._onCreate.notify(this, [key, value]);
};

VarMap.prototype.get = function (key) {
    this._onBeforeGet.notify(this, [key]);

    var map = this._map;
    var mapInv = this._mapInv;
    
    if(map.hasOwnProperty(key)) {
        return map[key];
    }
    
    var value = key;
    while(mapInv.hasOwnProperty(value) || this._reserved.hasOwnProperty(value)) {
        value = '$' + value;
    }
    
    this._create(key, value);
    return value;
};

VarMap.prototype.forEach = function (fn) {
    var map = this._map;
    for (var key in map) {
        if(map.hasOwnProperty(key)) {
            fn(key, map[key]);
        }
    }
};

VarMap.prototype.reserve = function (key) {
    this._reserved[key] = true;
    this._onReserve.notify(this, [key]);
};

VarMap.prototype.branch = function () {
    // redefine variables to new, non-clashing values
    var map = new VarMap();
    
    // copy across all reserved values (note this allows multiple branches require new values to not clash with all previous levels)
    Object.keys(this._reserved).forEach(map.reserve.bind(map));
    
    // copy all mapped variable values to reserved values
    this.forEach(function (key, value) {
        map.reserve(value);
    });
    
    // Ensure newly created variables in branch map create variables in source map... 
    var that = this;
    map._onBeforeGet.add(function (key) {
        that.get(key);
    });

    // ...and thus reserve value in branch map
    this._onCreate.add(function (key, value) {
        map.reserve(value);
    });

    // Ensure newly reserved variables get reserved in branch map too
    this._onReserve.add(function (key) {
        map.reserve(key);
    });
    
    return map;
};

VarMap.prototype.scope = function () {
    // create a new variable map for use within a new scope
    // variables created in this map will not be created in the outer map
    var map = new VarMap();
    
    // should reserve same values as the outer map
    Object.keys(this._reserved).forEach(map.reserve.bind(map));
    
    // should map all same values as the outer map
    this.forEach(function (key, value) {
        map._create(key, value);
    });
    
    return map;
};

exports.VarMap = VarMap;