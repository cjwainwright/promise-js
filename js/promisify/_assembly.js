//#include _copyright.js
(function (exports, parse, log) {

    exports.exportTo = function (o) {
        for (var key in exports) {
            if (exports.hasOwnProperty(key)) {
                o[key] = exports[key];
            }
        }
    };
    
    //#include ../promise/utils.js
    //#include ../promise/event.js
    //#include varmap.js
    //#include processor.js
    //#include compile.js

})(
    typeof exports === 'undefined' ? (promisify = {}) : exports,
    typeof esprima === 'undefined' ? function(){throw new Error("No parsing library available"); } : esprima.parse,
    console || { error: function(){} }
);
