module("VarMap", {
    setup: function () {
        this.map = new promisify.VarMap();
    }
});

test("unreserved and unmapped values should be unchanged", function () {
    var map = this.map;
    ['a', 'b', 'c', 'qwerty', 'promise', '$promise'].forEach(function (val) {
        strictEqual(map.get(val), val, val);
    });
});

test("mapped value should be consistent on each retrieval", function () {
    var map = this.map;
    
    var val = map.get('a');
    
    strictEqual(map.get('a'), val);
    strictEqual(map.get('a'), val);
    strictEqual(map.get('a'), val);
});

test("forEach should not iterate when no values mapped", function () {
    var map = this.map;
    
    var called = false;
    var val = map.forEach(function () {
        called = true;
    });
    
    ok(!called);
});

test("forEach should iterate over all map values", function () {
    var map = this.map;
    
    var keys = ['a', 'b', 'c'], 
        vals = [];
    
    keys.forEach(function (key) {
        vals.push(map.get(key));
    });
        
    map.forEach(function (key, val) {
        var keyExpected = keys.shift();
        var valExpected = vals.shift();
        
        strictEqual(key, keyExpected);
        strictEqual(val, valExpected);
    });
    
    strictEqual(keys.length, 0);
});

test("reserved values should map to next available prefixed value", function () {
    var map = this.map;
    map.reserve('test');
    var val = map.get('test');
    
    strictEqual(val, '$test');
});

test("reserved values should map to next available prefixed value when first also reserved", function () {
    var map = this.map;
    map.reserve('test');
    map.reserve('$test');
    
    strictEqual(map.get('test'), '$$test');
});

test("reserved values should map to next available prefixed value when multiple also reserved", function () {
    var map = this.map;
    map.reserve('test');
    map.reserve('$test');
    map.reserve('$$test');
    map.reserve('$$$test');
    
    strictEqual(map.get('test'), '$$$$test');
});

test("reserved values should map to next available prefixed value when first also mapped", function () {
    var map = this.map;
    map.reserve('test');
    map.get('$test'); 
    
    strictEqual(map.get('test'), '$$test');
});

test("reserved values should map to next available prefixed value when multiple also mapped", function () {
    var map = this.map;
    map.reserve('test');
    map.get('$test'); 
    map.get('$$test'); 
    map.get('$$$test'); 
    
    strictEqual(map.get('test'), '$$$$test');
});

test("branch should return a new VarMap", function () {
    var map = this.map;
    
    var branchMap = map.branch();
    
    ok(branchMap instanceof promisify.VarMap);
    notStrictEqual(branchMap, map);
});

test("when value mapped, retrieving same value from branch map should return next available prefixed value", function () {
    var map = this.map;
    map.get('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('a'), '$a');
});

test("when value mapped, retrieving different value from branch map should return next available prefixed value", function () {
    var map = this.map;
    map.get('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('b'), 'b');
});

test("when value reserved, retrieving same value from branch map should return next available prefixed value", function () {
    var map = this.map;
    map.reserve('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('a'), '$a');
});

test("when value reserved and mapped, retrieving same value from branch map should return next available prefixed value", function () {
    var map = this.map;
    map.reserve('a');
    map.get('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('a'), '$$a');
});
