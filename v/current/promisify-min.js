/*!
Copyright (c) 2012, C J Wainwright, http://cjwainwright.co.uk

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
(function(f,d,e){f.exportTo=function(p){for(var n in f){if(f.hasOwnProperty(n)){p[n]=f[n]}}};var c=function(n,p){if(n!=null){var o=g[n.type];if(o){o(n,p)}else{p.push("/* unknown type ",n.type," */");e.error("unknown type "+n.type)}}};var j="promise.",a=";\n";var h={"!":"not"};var i={"+":"add","*":"mult","==":"eq","!=":"neq","<":"lt","<=":"lteq",">":"gt",">=":"gteq"};var m={"++":"inc","--":"dec"};var l=function(n){switch(n.type){case"Literal":return n.raw;case"Identifier":return n.name}e.error("unknown key type "+n.type)};var g={Program:function(n,o){n.body.forEach(function(p){c(p,o)})},EmptyStatement:function(n,o){o.push(a)},BlockStatement:function(n,o){o.push("{\n");n.body.forEach(function(p){c(p,o)});o.push("}")},ExpressionStatement:function(n,o){c(n.expression,o);o.push(a)},ReturnStatement:function(n,o){o.push("return ");if(n.argument){c(n.argument,o)}else{o.push(j,"unit()")}o.push(a)},Literal:function(n,o){o.push(j,"unit(",n.raw,")")},Identifier:function(n,o){o.push(n.name)},VariableDeclaration:function(n,o){o.push(n.kind);n.declarations.forEach(function(p,q){o.push(q==0?" ":", ");c(p.id,o);if(p.init){o.push(" = ");c(p.init,o)}});o.push(a)},AssignmentExpression:function(n,o){c(n.left,o);o.push(" = ");c(n.right,o)},UnaryExpression:function(n,p){var o=h[n.operator];if(o!=null){p.push(j,o,"(");c(n.argument,p);p.push(")")}else{e.error("unknown unary operator "+n.operator)}},BinaryExpression:function(n,o){var p=i[n.operator];if(p!=null){o.push(j,p,"(");c(n.left,o);o.push(", ");c(n.right,o);o.push(")")}else{e.error("unknown binary operator "+n.operator)}},UpdateExpression:function(n,o){var p=m[n.operator];if(p!=null){if(n.prefix){o.push("(");c(n.argument,o);o.push(" = ",j,p,"(");c(n.argument,o);o.push("))")}else{o.push("(function(){ var $ret = ");c(n.argument,o);o.push(";");c(n.argument,o);o.push(" = ",j,p,"(");c(n.argument,o);o.push("); return $ret;}())")}}else{e.error("unknown update operator "+n.operator)}},ObjectExpression:function(n,o){o.push(j,"unit(new ",j,"DynamicObject({");n.properties.forEach(function(q,p){if(p>0){o.push(", ")}if(q.kind=="init"){o.push(l(q.key),": ");c(q.value,o)}else{e.error("unknown property kind "+q.kind)}});o.push("}))")},ArrayExpression:function(n,o){o.push(j,"unit(new ",j,"DynamicArray([");n.elements.forEach(function(q,p){if(p>0){o.push(", ")}c(q,o)});o.push("]))")},MemberExpression:function(n,o){o.push(j,"getMember(");c(n.object,o);o.push(", ");if(n.computed){c(n.property,o)}else{o.push(j,"unit('",n.property.name,"')")}o.push(").val")}};function k(r){var n=d(r.toSource());var p=n.body[0];if(p.type!="FunctionDeclaration"){if(n.body[0].expression&&n.body[0].expression.type=="FunctionExpression"){p=n.body[0].expression}else{throw new Error("Not a function declaration")}}if(p.body.type!="BlockStatement"){throw new Error("Function doesn't contain block statement")}var s=p.params;var o=s.map(function(t){return t.name});var q=[];p.body.body.forEach(function(t){c(t,q)});o.push(q.join(""));return Function.apply(null,o)}function b(o){var p=[];var n=d(o,p);c(n,p);return p.join("")}f.map=b;f.compile=k})(typeof exports==="undefined"?(promisify={}):exports,typeof esprima==="undefined"?function(){throw new Error("No parsing library available")}:esprima.parse,console||{error:function(){}});