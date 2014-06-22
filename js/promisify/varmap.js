function VarMap() {
    this._map = {};
    this._mapInv = {};
    this._reserved = {};
}

VarMap.prototype._create = function (key, value) {
    this._map[key] = value;
    this._mapInv[value] = key;
};

VarMap.prototype.get = function (key) {
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
    
    // TODO - need way for newly created variables in new map to create variable in source map (and thus reserved value in this map)
    
    return map;
};

exports.VarMap = VarMap;