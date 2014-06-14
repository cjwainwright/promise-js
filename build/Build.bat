preprocessor.exe ..\js\promise\_assembly.js ..\v\current\promise.js
java -jar yuicompressor-2.4.7.jar --charset utf-8 -v -o ..\v\current\promise-min.js ..\v\current\promise.js

preprocessor.exe ..\js\promisify\_assembly.js ..\v\current\promisify.js
java -jar yuicompressor-2.4.7.jar --charset utf-8 -v -o ..\v\current\promisify-min.js ..\v\current\promisify.js

preprocessor.exe ..\tests\src\_assembly.js ..\tests\tests.js
pause
