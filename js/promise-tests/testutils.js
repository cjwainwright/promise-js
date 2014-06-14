var timeTolerance = 20;

function promiseTest(testName, expectedTime, callback, assertKept, assertBroken) {
    if (assertBroken == null) {
        assertBroken = function (time) { 
            ok(false, "Promise broken unexpectedly"); 
        };
    }
    asyncTest(testName, function(){
        var startTime = Date.now();
        var ret = callback();
        var timeout = setTimeout(function () {
            ok(false, "too slow - actual: " + (Date.now() - startTime) + ", expected: " + expectedTime);
            start();
        }, expectedTime + timeTolerance)
        ret.kept(function(data) {
            clearTimeout(timeout);
            if (Date.now() - startTime < expectedTime - timeTolerance) {
                ok(false, "too fast - actual: " + (Date.now() - startTime) + ", expected: " + expectedTime);
            }
            assertKept(data);
            start();
        }).broken(function() {
            clearTimeout(timeout);
            if (Date.now() - startTime < expectedTime - timeTolerance) {
                ok(false, "too fast - actual: " + (Date.now() - startTime) + ", expected: " + expectedTime);
            }
            assertBroken();
            start();
        });
    });
}
