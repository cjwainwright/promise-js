promise-js
==========

A JavaScript library designed as the target of transcompilation from a language in which everything is a [promise](http://en.wikipedia.org/wiki/Promise_%28programming%29). Note this is a work in progress. The source language is probably going to end up as a subset of JavaScript itself.

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
var a = new Variable(laterData(1, 1000));
var b = new Variable(add(a.current, nowData(2));
```

Here, `laterData` is just a convenient test method which takes the role of `1'`. The variables are created with the `Variable` constructor, assigning promises to a variable is either done at construction time, or later with the `assign` method. Note the `current` property on the variable exposes the assigned promise.

Note, these objects and methods (such as `Variable` and `add`) are exposed on the `promise` namespace in the library. If you'd rather not keep writing `promise.Variable` etc. you can make them global so you can use them as above by calling

```js
promise.exportTo(window);
```

What it can do so far
-----
* Arithmetic and comparison (`+`, `*`, `==`, `<`, etc.)
* A general way to map any function of values to a function of promises (`fmap`, think [Monads](http://en.wikipedia.org/wiki/Monad_(functional_programming)))
* Variables (`var`)
* Objects (`{}` get and set accessors)
* Arrays (`[]` get and set accessors)
* Branching (`switch`, `if`, `else`)
* Looping (`while`)

See the samples for examples of all of these.

What it can't do yet
-----
* There is no (trans)compiler from the as yet mysterious "source" language
* All the things you want from a language that aren't in the previous list!