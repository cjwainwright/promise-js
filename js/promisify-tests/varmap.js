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
    
    strictEqual(branchMap.get('b'), '$b');
});

test("when value reserved and mapped, retrieving same value from branch map should return next available prefixed value", function () {
    var map = this.map;
    map.reserve('a');
    map.get('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('a'), '$$a');
});

test("when value reserved, retrieving same value from branch map should return next available prefixed value", function () {
    // should behave same as if reserved and mapped
    var map = this.map;
    map.reserve('a');
    
    var branchMap = map.branch();
    
    strictEqual(branchMap.get('a'), '$$a');
});

test("when value first accessed in source map after branching, retrieving same value from branch map should return next available prefixed value", function () {
    var map = this.map;
    var branchMap = map.branch();    
    
    var val = map.get('a');
    
    strictEqual(branchMap.get('a'), '$a');
});

test("when value first accessed in branch map without access in source map, should behave as if already accessed in source map", function () {
    var map = this.map;
    
    var branchMap = map.branch();    
    
    var branchVal = branchMap.get('a');
    var val = map.get('a');
    
    strictEqual(val, 'a');
    strictEqual(branchVal, '$a');
});

test("when value reserved in source map after branching, should behave as if also reserved in branch map", function () {
    var map = this.map;
    
    var branchMap = map.branch();
    
    map.reserve('a');

    strictEqual(branchMap.get('a'), '$$a');
});

test("branching a second time should not affect the first branch (get)", function () {
    var map = this.map;
    var branchMap = map.branch();    
    var branchMap2 = map.branch();    
    
    map.get('a');
    
    strictEqual(branchMap.get('a'), '$a');
});

test("branching a second time should not affect the first branch (reserve)", function () {
    var map = this.map;
    var branchMap = map.branch();    
    var branchMap2 = map.branch();    
    
    map.reserve('a');
    
    strictEqual(branchMap.get('a'), '$$a');
});

test("second branch should behave as the first branch (get)", function () {
    var map = this.map;
    var branchMap = map.branch();    
    var branchMap2 = map.branch();    
    
    map.get('a');
    
    strictEqual(branchMap2.get('a'), '$a');
});

test("second branch should behave as the first branch (reserve)", function () {
    var map = this.map;
    var branchMap = map.branch();    
    var branchMap2 = map.branch();    
    
    map.reserve('a');
    
    strictEqual(branchMap2.get('a'), '$$a');
});
