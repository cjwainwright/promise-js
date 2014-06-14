preprocessor.exe ..\js\promise\_assembly.js ..\v\current\promise.js
java -jar yuicompressor-2.4.7.jar --charset utf-8 -v -o ..\v\current\promise-min.js ..\v\current\promise.js

preprocessor.exe ..\js\promisify\_assembly.js ..\v\current\promisify.js
java -jar yuicompressor-2.4.7.jar --charset utf-8 -v -o ..\v\current\promisify-min.js ..\v\current\promisify.js

preprocessor.exe ..\js\promise-tests\_assembly.js ..\v\current\promise-tests.js
preprocessor.exe ..\js\promisify-tests\_assembly.js ..\v\current\promisify-tests.js
pause
