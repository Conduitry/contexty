# Contexty

[![npm version](https://img.shields.io/npm/v/contexty.svg?style=flat-square)](https://www.npmjs.com/package/contexty)

**Contexty** is a very simple implementation of a "thread-local storage"-esque concept for Node.js, based on asynchronous resources.

For example: Early in handling an HTTP request, you can create a new context. Elsewhere in your code, you can retrieve the current context and get/set values on it. The context is preserved for the duration of that HTTP request, but is kept separate for different HTTP requests.

## Requirements

A current nightly Node.js build, for now. My understanding is that the `async_hooks` features and fixes that this relies on will be released in Node.js 8.2.0. This section will be updated accordingly as Node.js versions are officially released.

## Usage

Create an instance of `Contexty` to create a "namespace" in which you want to share contexts. You should use the same `Contexty` anywhere you want to have access to the same context. In many applications, you will only need a single `Contexty` instance, which should be created *outside* your code which handles requests etc.

`let contexty = new Contexty()`

When you want to create a new context, retrieve `contexty.new`. This is a getter which returns a new context (an object with `null` prototype). Store whatever you want on here. Later in the same or in a descendent asynchronous resource, the `contexty.current` getter will return that same context object.

Retrieving `contexty.new` when there is already an asynchronous context will create a new context with the old one as its prototype, so you have access to all the parent values, but new values you add to the context will not affect the parent context.

## API

### `new Contexty()`

Creates a new object to manage async contexts for a particular purpose.

### `Contexty#new`

This getter creates and returns a new context. If a context already existed, the new context will be a child context. You can access values stored on the parent context, and any changes will no longer be accessible once you are out of this asynchronous call tree.

### `Contexty#current`

This getter retrieves the context created by the appropriate asynchronously ancestral `Contexty#new`.

## Example

```javascript
let { Contexty } = require('contexty')

let contexty = new Contexty()

let counter = 0

async function test() {
	contexty.new.foo = ++counter
	console.log('A', contexty.current.foo)
	await sleep(1000)
	console.log('B', contexty.current.foo)
	setTimeout(test2, 2000)
	await sleep(4000)
	console.log('C', contexty.current.foo)
}

function test2() {
	console.log('D', contexty.current.foo)
	contexty.new.foo = 'x'
	console.log('E', contexty.current.foo)
	sleep(1000).then(() => {
		console.log('F', contexty.current.foo)
	})
}

for (let i = 0; i < 3; i++) {
	test()
}

function sleep(ms) {
	return new Promise(res => setTimeout(res, ms))
}
```

Output:

```
A 1
A 2
A 3
B 1
B 2
B 3
D 1
E x
D 2
E x
D 3
E x
F x
F x
F x
C 1
C 2
C 3
```

## License

Copyright (c) 2017 Conduitry

- [MIT](https://github.com/Conduitry/contexty/blob/master/LICENSE)
