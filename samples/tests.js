var samples = {
    "1' < 2'": function () {
        var a = laterData(1, 500);
        var b = laterData(2, 1000);
        return lt(a, b);
    },

    "1' + 2'": function () {
        var a = laterData(1, 500);
        var b = laterData(2, 1000);
        return add(a, b);
    },

    "1' + *'": function () {
        var a = laterData(1, 500);
        var b = laterBreak(1000);
        return add(a, b);
    },

    "4 + 5": function () {
        var a = nowData(4);
        var b = nowData(5);
        return add(a, b);
    },
    
    "3 + 4'": function () {
        var a = nowData(3);
        var b = laterData(4, 1000);
        return add(a, b);
    },
    
    "(3' + 4') * 5'": function () {
        var a = laterData(3, 500);
        var b = laterData(4, 1000);
        var c = laterData(5, 700);
        return mult(add(a, b), c);
    },
    
    "var a = 1'; var b = a; a = 2'; var c = a; b + c;": function () {
        var a = new Variable(laterData(1, 1000));
        var b = new Variable(a.current);
        a.assign(laterData(2, 500));
        var c = new Variable(a.current);
        return add(b.current, c.current);
    },
    
    "var a = 1'; ++a": function () {
        var a = new Variable(laterData(1, 1000));
        a.assign(inc(a.current));
        return a.current;
    },
    
    "var a = 2'; a = 3 * a;": function () {
        var a = new Variable(laterData(2, 1000));
        a.assign(mult(nowData(3), a.current));
        return a.current;
    },
    
    // Dynamic array (as value)
    "var a = new Array(); a[1] = 1'; a[1];": function () {
        var a = new DynamicArray();
        a.set(nowData(1), laterData(1, 1000));
        return a.get(nowData(1));
    },
    
    "var a = new Array(); a[1'] = 1; a[1];": function () {
        var a = new DynamicArray();
        a.set(laterData(1, 1000), nowData(1));
        return a.get(nowData(1));
    },
        
    "var a = new Array(); a[1'] = 1; a[1] = 2; a[1];": function () {
        var a = new DynamicArray();
        a.set(laterData(1, 1000), nowData(1));
        a.set(nowData(1), nowData(2));
        return a.get(nowData(1));
    },
        
    "var a = new Array(); a[1'] = 1; a[1] = a[1'] + 1; a[1];": function () {
        var a = new DynamicArray();
        a.set(laterData(1, 1000), nowData(1));
        a.set(nowData(1), add(a.get(laterData(1, 400)), nowData(1)));
        return a.get(nowData(1));
    },
        
    "var a = new Array(); a[0] = 0; a[1] = 1; swap(a); a;": function () {
        function swap(a) {
            var t = a.get(nowData(0));
            a.set(nowData(0), a.get(nowData(1)));
            a.set(nowData(1), t);
        }
        
        var b = new DynamicArray();
        b.set(nowData(0), nowData(0));
        b.set(nowData(1), nowData(1));
        swap(b);
        
        return add(b.get(nowData(0)), nowData(','), b.get(nowData(1)));
    },
        
    "var a = new Array(); a[0] = 0; a[1] = 1; swap(a, 0', 1'); a;": function () {
        function swap(a, i, j) {
            var t = a.get(i);
            a.set(i, a.get(j));
            a.set(j, t);
        }
        
        var b = new DynamicArray();
        b.set(nowData(0), nowData(0));
        b.set(nowData(1), nowData(1));
        swap(b, laterData(0, 500), laterData(1, 1000));
        
        return add(b.get(nowData(0)), nowData(','), b.get(nowData(1)));
    },
    
    "var a = new Array(); a[0'] = 1'; var b = a[0']; a[0'] = 2'; a[0];": function () {
        var a = new DynamicArray();
        var b = new Variable();
        
        a.set(laterData(0, 1000), laterData(1, 6000)); // note the delay in the value here doesn't hold the array up as we're just adding the promise
        b.assign(a.get(laterData(0, 8000))); // note the delay on the index here doesn't hold up future writes
        a.set(laterData(0, 1000), laterData(2, 1000));
        return a.get(nowData(0));
    },
    
    // Dynamic Object (as value)
    "var o = new Object(); o[name'] = 1'; o[name];": function () {
        var o = new DynamicObject();
        
        o.set(laterData('name', 1000), laterData(1, 500));
        return o.get(nowData('name'));
    },
    
    "var o = new Object(); o[key1'] = 1'; o[key2'] = o[key1']; o[key2];": function () {
        var o = new DynamicObject();
        
        o.set(laterData('key1', 1000), laterData(1, 500));
        o.set(laterData('key2', 1000), o.get(laterData('key1')));
        return o.get(nowData('key2'));
    },
    
    "var o = new Object(); o[key] = 1'; var b = o[key']; o[key'] = 2'; b;": function () {
        var o = new DynamicObject();
        var b = new Variable();
        
        o.set(laterData('key', 1000), laterData(1, 6000)); // note the delay in the value here doesn't hold the array up as we're just adding the promise
        b.assign(o.get(laterData('key', 8000))); // note the delay on the index here doesn't hold up future writes
        o.set(laterData('key', 1000), laterData(2, 1000));
        return b.current;
    },
    
    "var o = new Object(); o[key'] = 1'; delete o[key']; o[key'];": function () {
        var o = new DynamicObject();
        
        o.set(laterData('key', 1000), laterData(1, 6000));
        o.delete(laterData('key', 2000));
        return o.get(laterData('key', 1000));
    },
    
    "var o = new Object(); o[*'] = 1';": function () {
        var o = new DynamicObject();
        
        o.set(laterBreak(1000), laterData(1, 6000));
        return nowData("wait for the error", 1000);
    },  
    
    // Dynamic Object (as  variable)
    "var o = new Object()'; o[name'] = 1'; o[name];": function () {
        var o = new Variable(laterData(new DynamicObject(), 1000)); 
        set(o.current, laterData('name', 1000), laterData(1, 500));
        return get(o.current, nowData('name'));
    },

    "var o = new Object()'; o = 1; o[name];": function () {
        var o = new Variable(laterData(new DynamicObject(), 1000)); 
        o.assign(nowData(1));
        return get(o.current, nowData('name'));
    },
    
    "var o = new Object()'; o[key'] = new Object()'; o[key][key2'] = 1'; o[key][key2];": function () {
        var o = new Variable(laterData(new DynamicObject(), 1000));
        set(o.current, laterData('key', 500), laterData(new DynamicObject(), 2000));
        set(get(o.current, nowData('key')), laterData('key2', 700), laterData(1, 1500)); // room for compiler optimisations here, can the o[key] accessors be pulled out into one access??
        return get(get(o.current, nowData('key')), nowData('key2'));
    },
    
    // Dynamic Array (as  variable)
    "var a = new Array()'; a[0'] = 0'; a[2'] = 2'; a.length;": function () {
        var a = new Variable(laterData(new DynamicArray(), 1000)); 
        set(a.current, laterData(0, 1000), laterData(0, 500));
        set(a.current, laterData(2, 700), laterData(2, 1500));
        return length(a.current);
    },
    
    // if else (now)
    "var a; iif(true'){a = 1;} else {a = 2;} a;": function () {
        var a = new Variable();
        ifelseNow(laterData(true, 1000), [a], function (a) { a.assign(nowData(1)); }, function (a) { a.assign(nowData(2)); });
        return a.current;
    },

    "var a; iif(false'){a = 1;} else {a = 2;} a;": function () {
        var a = new Variable();
        ifelseNow(laterData(false, 2000), [a], function (a) { a.assign(nowData(1)); }, function (a) { a.assign(nowData(2)); });
        return a.current;
    },

    "var a = 1'; iif(true'){a++;} a;": function () {
        var a = new Variable(laterData(1, 2000));
        ifelseNow(laterData(true, 1000), [a], function (a) { a.assign(inc(a.current)); }, function (a) { });
        return a.current;
    },
    
    "var a = 1', b = 2; iif(true'){a = b; b++; a = a - 1';} a;": function () {
        var a = new Variable(laterData(1, 2000));
        var b = new Variable(nowData(2));
        ifelseNow(laterData(true, 1000), [a, b], function (a, b) { 
            a.assign(b.current);
            b.assign(inc(b.current)); 
            a.assign(add(a.current, laterData(-1, 2500)));
        }, function (a, b) { });
        return a.current;
    },
    
    // if else (later)
    "var a; if(true'){a = 1;} else {a = 2;} a;": function () {
        var a = new Variable();
        ifelseLater(laterData(true, 1000), [a], function (a) { a.assign(nowData(1)); }, function (a) { a.assign(nowData(2)); });
        return a.current;
    },

    "var a; if(false'){a = 1;} else {a = 2;} a;": function () {
        var a = new Variable();
        ifelseLater(laterData(false, 2000), [a], function (a) { a.assign(nowData(1)); }, function (a) { a.assign(nowData(2)); });
        return a.current;
    },

    "var a = 1'; if(true'){a++;} a;": function () {
        var a = new Variable(laterData(1, 2000));
        ifelseLater(laterData(true, 1000), [a], function (a) { a.assign(inc(a.current)); }, function (a) { });
        return a.current;
    },
    
    "var a = 1', b = 2; if(true'){a = b; b++; a = a - 1';} a;": function () {
        var a = new Variable(laterData(1, 2000));
        var b = new Variable(nowData(2));
        ifelseLater(laterData(true, 1000), [a, b], function (a, b) { 
            a.assign(b.current);
            b.assign(inc(b.current)); 
            a.assign(add(a.current, laterData(-1, 2500)));
        }, function (a, b) { });
        return a.current;
    },

    // loop
    "var a = 1; while (false) {  } a;": function () {
        var a = new Variable(nowData(1));
        loopWhile(
            [a], 
            function (a) { 
                return nowData(false); 
            }, 
            [a], 
            function (a) { 
            }
        );
        return a.current;
    },
    
    "var a = 1; while (false') { } a;": function () {
        var a = new Variable(nowData(1));
        loopWhile(
            [a], 
            function (a) { 
                return laterData(false, 1000); 
            }, 
            [a], 
            function (a) { 
            }
        );
        return a.current;
    },
    
    "var a = 1'; while (false') { } a;": function () {
        var a = new Variable(laterData(1, 2000));
        loopWhile(
            [a], 
            function (a) { 
                return laterData(false, 1000); 
            }, 
            [a], 
            function (a) { 
            }
        );
        return a.current;
    },
    
    "var a = 1; while (a < 1) { } a;": function () {
        var a = new Variable(nowData(1));
        loopWhile(
            [a], 
            function (a) { 
                return lt(a.current, nowData(1)); 
            }, 
            [a], 
            function (a) { 
            }
        );
        return a.current;
    },
    
    "var a = 0; while (a < 1) { a++;} a;": function () {
        var a = new Variable(nowData(0));
        loopWhile(
            [a], 
            function (a) { 
                return lt(a.current, nowData(1));
            }, 
            [a], 
            function (a) { 
                a.assign(inc(a.current));
            }
        );
        return a.current;
    },
    
    "var a = 1; while (a < 4) { a++; } a;": function () {
        var a = new Variable(nowData(1));
        loopWhile(
            [a], 
            function (a) { 
                return lt(a.current, nowData(4)); 
            }, 
            [a], 
            function (a) { 
                a.assign(inc(a.current)); 
            }
        );
        return a.current;
    },
    
    "var a = 1; while (a < 4') { a++; } a;": function () {
        var a = new Variable(nowData(1));
        loopWhile(
            [a], 
            function (a) { 
                return lt(a.current, laterData(4, 1000)); 
            }, 
            [a], 
            function (a) { 
                a.assign(inc(a.current)); 
            }
        );
        return a.current;
    },

    "var a = 1, b = 10; while (a < b) { a++; b--; } a;": function () {
        var a = new Variable(nowData(1)),
            b = new Variable(nowData(10));
        loopWhile(
            [a, b], 
            function (a, b) { 
                return lt(a.current, b.current); 
            }, 
            [a, b], 
            function (a, b) { 
                a.assign(inc(a.current)); 
                b.assign(dec(b.current)); 
            }
        );
        return a.current;
    },

    "var a = 1, b = 10; while (a < b) { a += 1'; b -= 1'; } a;": function () {
        var a = new Variable(nowData(1)),
            b = new Variable(nowData(10));
        loopWhile(
            [a, b], 
            function (a, b) { 
                return lt(a.current, b.current); 
            }, 
            [a, b], 
            function (a, b) { 
                a.assign(add(a.current, laterData(1, 100))); 
                b.assign(add(b.current, laterData(-1, 200))); 
            }
        );
        return a.current;
    },

    "var a = 1; while (true) { a += 1'; if (a >= 5) { break; } } a;": function () {
        var a = new Variable(nowData(1));
        loopWhile(
            [a], 
            function (a) { return nowData(true); }, 
            [a], 
            function (a) { 
                var breakOut = new Promise(); // note, are using a promise here, so can't use ifelseNow below as will evaluate both branches assigning twice to a promise, also need to be careful about using other breaks
                a.assign(add(a.current, laterData(1, 100))); 
                ifelseLater(
                    gteq(a.current, nowData(5)), 
                    [], 
                    function () { 
                        breakOut.setData(true); 
                    }, 
                    function () { 
                        breakOut.setData(false); 
                    }
                );
                return breakOut;
            }
        );
        return a.current;
    },

    "var a = 1; while (true') { a += 1'; if (a >= 5') { break; } } a;": function () {
        var a = new Variable(nowData(1));
        loopWhile(
            [a], 
            function (a) { return laterData(true, 100); }, 
            [a], 
            function (a) { 
                var breakOut = new Promise(); // note, are using a promise here, so can't use ifelseNow below as will evaluate both branches assigning twice to a promise, also need to be careful about using other breaks
                a.assign(add(a.current, laterData(1, 100))); 
                ifelseLater(
                    gteq(a.current, laterData(5, 1000)), 
                    [], 
                    function () { 
                        breakOut.setData(true); 
                    }, 
                    function () { 
                        breakOut.setData(false); 
                    }
                );
                return breakOut;
            }
        );
        return a.current;
    }    
}

window.onload = function () {
    for(var s in samples) {
        var button = document.createElement('BUTTON');
        button.appendChild(document.createTextNode(s));
        button.sample = s;
        button.onclick = function () { 
            var start = Date.now();
            var ret = samples[this.sample](); 
            ret.kept(function (data) {
                console.log('kept, ' + data + '  (in ' + (Date.now() - start) + 'ms)');
            }).broken(function () {
                console.log('broken (in ' + (Date.now() - start) + 'ms)');
            });
        };
        document.body.insertBefore(button, document.body.firstChild);
        document.body.insertBefore(document.createElement('BR'), document.body.firstChild);
    }
};