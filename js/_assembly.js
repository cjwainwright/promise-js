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
    //#include flow.js
    //#include loop.js
    //#include providers.js

})(typeof exports === 'undefined' ? (promise = {}) : exports);