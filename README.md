# Contexty

[![npm version](https://img.shields.io/npm/v/contexty.svg?style=flat-square)](https://www.npmjs.com/package/contexty)

**Contexty** is a very simple implementation of a "thread-local storage"-esque concept for Node.js, based on asynchronous resources and `async_hooks`.

## Motivation

At the beginning of handling an HTTP request, you can create a new context. Elsewhere in your code, you can retrieve the current context object and get/set values on it. The context is preserved for the duration of that HTTP request, but is kept separate for different HTTP requests. This all happens without you having to pass the current context object around.

## Requirements

- [Node.js](https://nodejs.org/) 8.2+ (currently in [release candidate](https://nodejs.org/download/rc/) stage), or a [nightly build](https://nodejs.org/download/nightly/)

## Usage

Create an instance of `Contexty` to create a "context space" in which you want to share contexts. You should use the same `Contexty` anywhere you want to have access to the same context. In many applications, you will only need a single `Contexty` instance, which should be created *outside* the code is called asynchronously for each request/whatever.

`let contexty = new Contexty()`

When you want to create a new context, call `contexty.create()`. This returns a new context (an object with `null` prototype). Store whatever you want on here. Later in the same or in a descendent asynchronous call, the `contexty.context` getter will return that same context object.

Calling `contexty.create()` when there is already an asynchronous context will create a new context with the old one as its prototype, so you have access to all the parent values, but new values you add to the context will not affect the parent context.

## API

### `new Contexty()`

Creates a new object to manage asynchronous contexts for a particular purpose.

### `Contexty#create()`

Creates and returns a new context. If a context already exists, the new context will be a child context. You can access values stored on the parent context, and any changes will no longer be accessible once you are out of this asynchronous call tree.

### `Contexty#context`

The context created by the appropriate ancestor `Contexty#create`.

## Example

```javascript
let { Contexty } = require('contexty')
let contexty = new Contexty()

let EventEmitter = require('events')
let eventEmitter = new EventEmitter()
eventEmitter.on('foo', () => console.log('On event: ' + contexty.context.foo))

let counter = 0

async function test() {
	contexty.create().foo = ++counter
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
	contexty.create()
	console.log('In child context: ' + contexty.context.foo)
	contexty.context.foo = 'x'
	console.log('With overridden value: ' + contexty.context.foo)
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
In child context: 1
With overridden value: x
After timeout: 2
In child context: 2
With overridden value: x
After timeout: 3
In child context: 3
With overridden value: x
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
