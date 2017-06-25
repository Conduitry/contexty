# Contexty

[![npm version](https://img.shields.io/npm/v/contexty.svg?style=flat-square)](https://www.npmjs.com/package/contexty)

**Contexty** is a very simple implementation of a "thread-local storage"-esque concept for Node.js, based on asynchronous resources and `async_hooks`.

Typical usage and motivation: At the beginning of handling an HTTP request, you can create a new context. Elsewhere in your code, you can retrieve the current context and get/set values on it. The context is preserved for the duration of that HTTP request, but is kept separate for different HTTP requests.

## Requirements

A current nightly Node.js build, for now. My understanding is that the `async_hooks` features and fixes that this relies on will be released in Node.js 8.2.0. This section will be updated accordingly as Node.js versions are officially released.

## Usage

Create an instance of `Contexty` to create a "context space" in which you want to share contexts. You should use the same `Contexty` anywhere you want to have access to the same context. In many applications, you will only need a single `Contexty` instance, which should be created *outside* the code is called asynchronously for each request/whatever.

`let contexty = new Contexty()`

When you want to create a new context, retrieve `contexty.create`. This is a getter which returns a new context (an object with `null` prototype). Store whatever you want on here. Later in the same or in a descendent asynchronous call, the `contexty.context` getter will return that same context object.

Retrieving `contexty.create` when there is already an asynchronous context will create a new context with the old one as its prototype, so you have access to all the parent values, but new values you add to the context will not affect the parent context.

## API

### `new Contexty()`

Creates a new object to manage async contexts for a particular purpose.

### `Contexty#create`

This getter creates and returns a new context. If a context already exists, the new context will be a child context. You can access values stored on the parent context, and any changes will no longer be accessible once you are out of this asynchronous call tree.

### `Contexty#context`

This getter retrieves the context created by the appropriate ancestor `Contexty#create`.

## Example

```javascript
let { Contexty } = require('contexty')
let contexty = new Contexty()

let EventEmitter = require('events')
let eventEmitter = new EventEmitter()
eventEmitter.on('foo', () => console.log('On event: ' + contexty.context.foo))

let counter = 0

async function test() {
	contexty.create.foo = ++counter
	console.log('Immediately: ' + contexty.context.foo)
	await sleep(1000)
	console.log('After await: ' + contexty.context.foo)
	sleep(1000).then(() => {
		console.log('After .then()ed promise: ' + contexty.context.foo)
	})
	setTimeout(test2, 2000)
	await sleep(3000)
	console.log('Back in original context: ' + contexty.context.foo)
	await sleep(1000)
	eventEmitter.emit('foo')
}

function test2() {
	console.log('After timeout: ' + contexty.context.foo)
	contexty.create.foo = 'x'
	console.log('After creating child context: ' + contexty.context.foo)
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
Immediately: 1
Immediately: 2
Immediately: 3
After await: 1
After await: 2
After await: 3
After .then()ed promise: 1
After .then()ed promise: 2
After .then()ed promise: 3
After timeout: 1
After creating child context: x
After timeout: 2
After creating child context: x
After timeout: 3
After creating child context: x
Back in original context: 1
Back in original context: 2
Back in original context: 3
On event: 1
On event: 2
On event: 3
```

## License

Copyright (c) 2017 Conduitry

- [MIT](https://github.com/Conduitry/contexty/blob/master/LICENSE)
