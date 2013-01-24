promise-js
==========

A JavaScript library designed as the target of transcompilation from a language in which everything is a [promise](http://en.wikipedia.org/wiki/Promise_%28programming%29). Note this is a work in progress. The source language is a subset of JavaScript itself.
Transpilation can done dynamically.

The basics
--------

The intention is that a program could be written entirely as if it were synchronous. For example, consider the following simple program:

```
var a = 1';
var b = a + 2;
```

Note the `1'`, this is not a typo, it is (for want of a better notation) my way of saying that the value `1` will be retrieved asynchronously. The value we assign to `a` on the first line is not actually known at the time the line executes, instead we just have the promise of a value which will be populated with a value of `1` at a later time. 

Now we execute the second line, but still don't know the value of `a`. We proceed anyway to assign to `b` a new promise which will be the result of adding the value in `a` (which is that `1'` thing) and `2`. Thus all code proceeds in a non-blocking fashion and values are populated once all promises on which the value depends have been kept (which you may prefer to call resolved or fulfilled).

The transcompiled version of the above code should be:

```js
var a = laterData(1, 1000);
var b = add(a.current, unit(2));
```

Here, `laterData` is just a convenient test method which takes the role of `1'`.

Note, these objects and methods (such as `unit` and `add`) are exposed on the `promise` namespace in the library. If you'd rather not keep writing `promise.add` etc. you can make them global so you can use them as above by calling

```js
promise.exportTo(window);
```

What it can do so far
-----
* Arithmetic and comparison (`+`, `*`, `==`, `<`, etc.)
* A general way to map any function of values to a function of promises (`fmap`, think [Functors](http://en.wikipedia.org/wiki/Map_%28higher-order_function%29#Generalization))
* Objects (`{}` get and set accessors)
* Arrays (`[]` get and set accessors)
* Branching (`switch`, `if`, `else`)
* Looping (`while`)

See the samples for examples of these.

The transpiler
-----

There is a transpiler which makes use of the [Esprima](http://esprima.org/) JavaScript parser, the transpiler is exposed in the `promisify` namespace.
Functions written in JavaScript can be dynamically compiled into a new function accepting promises, a kind of glorified `fmap`. This is currently under development,
you can play with transpilation in the Playground.