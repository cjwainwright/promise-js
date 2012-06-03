/////////////////////////////////////////////////////
// Data provider functions
/////////////////////////////////////////////////////

function nowData(data) {
    var promise = new Promise();
    promise.setData(data);
    return promise;
}

function nowBreak() {
    var promise = new Promise();
    promise.setBroken();
    return promise;
}

function laterData(data, delay) {
    var promise = new Promise();
    setTimeout(function(){promise.setData(data);}, delay);
    return promise;
}

function laterBreak(delay) {
    var promise = new Promise();
    setTimeout(function(){promise.setBroken();}, delay);
    return promise;
}

function inputData(key, parser) {
    var ret = new Promise();
 
    var div = document.createElement('DIV');

    var input = document.createElement('INPUT');
    input.type = 'text';
    div.appendChild(input);

    var button = document.createElement('BUTTON');
    button.appendChild(document.createTextNode('>'));
    div.appendChild(button);

    var text = document.createTextNode('...');
    key.kept(function(data){
        text.data = data;
    }).broken(function(){
        text.data = '!!';
    });
    div.appendChild(text);
    
    document.body.appendChild(div);
    input.focus();
    
    button.addEventListener('click', function click() {
        ret.setData(parser ? parser(input.value) : input.value);
        input.disabled = true;
        button.disabled = true;
        button.removeEventListener('click', click);
    });
    return ret;
};

/////////////////////////////////////////////////////

exports.nowData = nowData;
exports.nowBreak = nowBreak;
exports.laterData = laterData;
exports.laterBreak = laterBreak;
exports.inputData = inputData;

/////////////////////////////////////////////////////
