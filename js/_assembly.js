//#include _copyright.js
(function (exports) {

    exports.exportTo = function (o) {
        for (var key in exports) {
            if (exports.hasOwnProperty(key)) {
                o[key] = exports[key];
            }
        }
    };

    //#include utils.js
    //#include event.js
    //#include promise.js
    //#include variable.js
    //#include collection.js
    //#include array.js
    //#include object.js
    //#include operations.js
    //#include providers.js

})(typeof exports === 'undefined' ? (promise = {}) : exports);

/* TODOs 
 * Clarify when we throw exceptions and when we set values as broken
 * When apply-ing functions what context should we be using
 * Can we make the variable/promise proxy all method calls to the underlying value data?
 */