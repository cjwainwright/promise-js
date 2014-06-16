/////////////////////////////////////////////////////

function errorFunc(message) {
    return function(){
        throw new Error(message);
    }
}

exports.errorFunc = errorFunc;

/////////////////////////////////////////////////////

var error = exports.error = {
    promiseBreakingAlreadyResolved: "Attempting to break a resolved promise", 
    promiseKeepingAlreadyResolved: "Attempting to keep a resolved promise", 
    collectionIndexBrokenPromise: "Can't use broken promise as collection index",
    collectionSetValueOnBrokenPromise: "Trying to set a value on a broken promise",
    conditionalBrokenPromise: "Can't use broken promise as conditional",
    queueNothingToDequeue: "Nothing to dequeue"
};

/////////////////////////////////////////////////////
