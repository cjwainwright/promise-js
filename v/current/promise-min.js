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
(function(J){J.exportTo=function(O){for(var N in J){if(J.hasOwnProperty(N)){O[N]=J[N]}}};if(typeof(Object.create)!=="function"){Object.create=function(O){function N(){}N.prototype=O;return new N()}}function a(O,N){O.prototype=Object.create(N.prototype);O.prototype.constructor=O;O.Parent=N}function E(){this._listeners=[]}E.prototype={add:function(N){this._listeners.push(N)},notify:function(P,N){var Q=this._listeners.length;for(var O=0;O<Q;O++){this._listeners[O].apply(P,N)}},clear:function(){this._listeners=[]}};var f="waiting",u="kept",t="broken";function B(){this.state=f;this.data;this._onkept=new E();this._onbroken=new E()}B.prototype={kept:function(N){if(this.state==f){this._onkept.add(N)}else{if(this.state==u){N(this.data)}}return this},broken:function(N){if(this.state==f){this._onbroken.add(N)}else{if(this.state==t){N(this.error)}}return this},setBroken:function(){if(this.state!=f){throw new Error("Attempting to break a resolved promise")}this.state=t;this._onbroken.notify(this);this._onkept.clear();this._onbroken.clear()},setData:function(N){if(this.state!=f){throw new Error("Attempting to keep a resolved promise")}this.data=N;this.state=u;this._onkept.notify(this,[this.data]);this._onkept.clear();this._onbroken.clear()},bindTo:function(N){this.kept(function(O){N.setData(O)}).broken(function(){N.setBroken()})}};function s(N){return function(){var P=new B();var O=[].slice.call(arguments);function R(){if(P.state!=f){return}var V=true;for(var T=0;T<O.length;T++){if(O[T].state!=u){V=false;break}}if(V){var W=[];for(var U=0;U<O.length;U++){W[U]=O[U].data}P.setData(N.apply(null,W))}}function S(){if(P.state!=f){return}P.setBroken()}for(var Q=0;Q<O.length;Q++){O[Q].kept(R).broken(S)}return P}}J.Promise=B;J.fmap=s;function m(N){this.current=N}m.prototype={assign:function(N){return this.current=N}};J.Variable=m;function b(){this._queue=[]}b.prototype={get:function(O){var N=new B();var P=this;this._enqueue(function(){var Q=P._currentsCopy();O.kept(function(R){if(Q[R]==null){N.setData(Q[R])}else{Q[R].bindTo(N)}}).broken(function(){N.setBroken()});P._dequeue()});return N},set:function(N,P){var O=this;this._enqueue(function(){N.kept(function(Q){O.currents[Q]=P;O._dequeue()}).broken(function(){throw new Error("Can't use broken promise as array index")})});return P},"delete":function(N,P){var O=this;this._enqueue(function(){N.kept(function(Q){delete O.currents[Q];O._dequeue()}).broken(function(){throw new Error("Can't use broken promise as array index")})});return P},_currentsCopy:function(){},_enqueue:function(N){this._queue.push(N);if(this._queue.length==1){this._queue[0]()}},_dequeue:function(){if(this._queue.length==0){throw new Error("Nothing to dequeue")}else{this._queue.shift();if(this._queue.length>0){this._queue[0]()}}}};function L(P,O){var N=new B();P.kept(function(Q){Q.get(O).bindTo(N)}).broken(function(){N.setBroken()});return N}function v(P,N,O){P.kept(function(Q){Q.set(N,O)}).broken(function(){throw new Error("Trying to set a value on a broken promise")});return O}J.get=L;J.set=v;function r(){r.Parent.call(this);this.currents=[]}a(r,b);r.prototype._currentsCopy=function(){return this.currents.slice()};r.prototype.length=function(){var N=new B();var O=this;this._enqueue(function(){N.setData(O.currents.length);O._dequeue()});return N};function p(O){var N=new B();O.kept(function(P){P.length().bindTo(N)}).broken(function(){N.setBroken()});return N}J.DynamicArray=r;J.length=p;function j(){j.Parent.call(this);this.currents={}}a(j,b);j.prototype._currentsCopy=function(){var O={};for(var N in this.currents){O[N]=this.currents[N]}return O};J.DynamicObject=j;var K=s(function(O,N){return O==N});var g=s(function(O,N){return O!=N});var x=s(function(O,N){return O<N});var G=s(function(O,N){return O<=N});var i=s(function(O,N){return O>N});var C=s(function(O,N){return O>=N});J.eq=K;J.neq=g;J.lt=x;J.lteq=G;J.gt=i;J.gteq=C;var d=s(function(){var N=arguments[0];for(var O=1;O<arguments.length;O++){N+=arguments[O]}return N});var D=s(function(){var N=arguments[0];for(var O=1;O<arguments.length;O++){N*=arguments[O]}return N});J.add=d;J.mult=D;var M=s(function(N){return ++N});var q=s(function(N){return --N});J.inc=M;J.dec=q;function H(U,S,R,N){var P=[];var Q;for(var T=0;T<N.length;T++){Q=P[T]=[];for(var O=0;O<S.length;O++){Q[O]=new m(S[O].current)}N[T].apply(null,Q)}for(var O=0;O<S.length;O++){S[O].assign(new B())}U.kept(function(W){Q=P[R(W)];for(var V=0;V<S.length;V++){Q[V].current.bindTo(S[V].current)}}).broken(function(){throw new Error("Can't use broken promise as predicate")})}function k(N,Q,O,P){H(N,Q,function(R){return R?1:0},[P,O])}function z(N,P,O){H(N,P,function(Q){return Q?1:0},[function(){},O])}function w(U,R,Q,S){var N=[];var O={};var T=0;N[T++]=S;for(var P in Q){O[P]=T;N[T++]=Q[P]}H(U,R,function(V){return O[V]},N)}function F(S,R,Q,N){var P=[];for(var O=0;O<R.length;O++){P[O]=new m(R[O].current);R[O].assign(new B())}S.kept(function(U){N[Q(U)].apply(null,P);for(var T=0;T<R.length;T++){P[T].current.bindTo(R[T].current)}}).broken(function(){throw new Error("Can't use broken promise as predicate")})}function o(N,Q,O,P){F(N,Q,function(R){return R?1:0},[P,O])}function n(N,P,O){F(N,P,function(Q){return Q?1:0},[function(){},O])}function e(U,R,Q,S){var N=[];var O={};var T=0;N[T++]=S;for(var P in Q){O[P]=T;N[T++]=Q[P]}F(U,R,function(V){return O[V]},N)}J.ifelseNow=k;J.ifNow=z;J.switchNow=w;J.ifelseLater=o;J.ifLater=n;J.switchLater=e;function l(R,X,W,O){var S,N=0;var P=[],V=[],Q=[],U=[];for(S=0;S<R.length;S++){V[S]=new m(R[S].current);R[S].assign(new B());R[S].allVarsIndex=N;Q[N]=R[S];U[N]=V[S];N+=1}for(S=0;S<W.length;S++){if("allVarsIndex" in W[S]){P[S]=U[W[S].allVarsIndex]}else{P[S]=new m(W[S].current);W[S].assign(new B());Q[N]=W[S];U[N]=P[S];N+=1}}for(S=0;S<R.length;S++){delete R[S].allVarsIndex}function T(){var Y=X.apply(null,V);Y.kept(function(ab){if(ab){var aa=O.apply(null,P);if(aa==null){T()}else{aa.kept(function(ad){if(!ad){T()}else{for(var ac=0;ac<Q.length;ac++){U[ac].current.bindTo(Q[ac].current)}}}).broken(function(){throw new Error("Broken promise in loop break")})}}else{for(var Z=0;Z<Q.length;Z++){U[Z].current.bindTo(Q[Z].current)}}}).broken(function(){throw new Error("Broken promise in a loop condition")})}T()}J.loopWhile=l;function I(N){var O=new B();O.setData(N);return O}function y(){var N=new B();N.setBroken();return N}function A(O,N){var P=new B();setTimeout(function(){P.setData(O)},N);return P}function h(N){var O=new B();setTimeout(function(){O.setBroken()},N);return O}function c(Q,U){var O=new B();var T=document.createElement("DIV");var N=document.createElement("INPUT");N.type="text";T.appendChild(N);var P=document.createElement("BUTTON");P.appendChild(document.createTextNode(">"));T.appendChild(P);var S=document.createTextNode("...");Q.kept(function(V){S.data=V}).broken(function(){S.data="!!"});T.appendChild(S);document.body.appendChild(T);N.focus();P.addEventListener("click",function R(){O.setData(U?U(N.value):N.value);N.disabled=true;P.disabled=true;P.removeEventListener("click",R)});return O}J.nowData=I;J.nowBreak=y;J.laterData=A;J.laterBreak=h;J.inputData=c})(typeof exports==="undefined"?(promise={}):exports);