promise-js
==========


The basics
----------

Imagine a language in which everything is a promise, data may not be immediately available, but when it is it flows through your code as far as it can.
You don't need to think about the asynchronous behaviour yourself, instead you write your code entirely as if everything were synchronous.
All code proceeds in a non-blocking fashion and values are populated once all promises on which the value depends have been resolved.
You can think of your code as the plumbing through which values will later flow.

Let's examine each term in the following simple line of code

```js
var b = a + 1;
```

Remember everything is a promise, so, the variable `a` holds a promise. 
We have not specified in this line of code where `a` comes from, for now we just take it as input to this line.
It's value may already be resolved, or it may be resolved at some point in the future, we don't know.

So how do we add `1` to this? Let us first consider the term `1` itself. As everything is a promise, we can think of `1` as the promise of the value `1` that is already resolved.
So what we're really doing is adding two promises.
The result: another promise.
This resulting promise is such that it will be resolved as soon as both input promises have been.

Finally we assign this promise to the variable `b` and can proceed to use this promise in subsequent code. 


Compile to JavaScript
-----------

Rather than inventing any new syntax, we take our new language to be (a subset of) JavaScript itself.
Just as above, everything is to be thought of as a promise.
This JavaScript is compiled to different JavaScript which implements the full promise based logic, allowing data to flow through your code asynchronously. 

Let's consider an example.
Suppose we want a function that squares a number, but we only have the promise of a number.
In our source language this function would look like

```js
function square(n) {
	return n * n;
}
```

We can compile this function using the `compile` method on the `promisify` module.
	
```js
var squarePromise = promisify.compile(square);
```

The resulting function, `squarePromise`, accepts a promise and returns the promise of the squared value.

Compiled code makes use of methods in the `promise` module to implement the relevant asynchronous logic.
In this case the compiled code would look like
	
```js
function (n) {
	return promise.mult(n, n);
}
```

The `promisify.compile` is implemented using the [Esprima](http://esprima.org/) JavaScript parser.


What it can do so far
-----

Currently, the following language constructs can be compiled

* Values and variables (`var a = 1`) 
* Arithmetic and comparison (`+`, `*`, `==`, `<`, etc.)
* Objects (`{}` get and set accessors)
* Arrays (`[]` get and set accessors)
* Branching (`if`, `else`)
* Looping (`while`)

See the [samples](samples/) for examples of these, and you can play with compiling code in the [playground](samples/playground.html).


Usage
-----

If you wish to use the library, merely include the two [JavaScript files](v/current/) and use to your hearts content

```html
<script src="promise-min.js"></script>
<script src="promisify-min.js></script>
<script>
	var delta = promisify.compile(function (a, b) {
		if (a > b) {
			return a - b;
		}
		return b - a;
	});
</script>
```

To build the library there is currently a [build script for Windows](build/Build.bat).

There are [test runners](testrunners/) for running unit tests for the promise and promisify libraries in the browser.


Is this practical?
-----------

It's not, it's more an academic exercise for now.
Languages are currently taking steps to make asynchronous code less complicated. 
Promises are a step on from callbacks. 
Yielding promises from generators allows code that looks even more like synchronous code.
To tidy this up even further we have the proposed async/await syntax.
The next logical step must surely be the case where you don't even have to think if something is async or not.
That is what we're trying to address here.
