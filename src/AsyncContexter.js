import { createHook, executionAsyncId } from 'async_hooks'

let asyncContexters = new Map()

createHook({
	init(asyncId, type, triggerAsyncId) {
		for (let contexts of asyncContexters.values()) {
			contexts.set(asyncId, contexts.get(triggerAsyncId))
		}
	},
	destroy(asyncId) {
		for (let contexts of asyncContexters.values()) {
			contexts.delete(asyncId)
		}
	},
}).enable()

export default class AsyncContexter {
	constructor() {
		asyncContexters.set(this, new Map())
	}
	new() {
		let asyncId = executionAsyncId()
		let contexts = asyncContexters.get(this)
		let context = Object.create(contexts.get(asyncId) || null)
		contexts.set(asyncId, context)
		return context
	}
	get current() {
		return asyncContexters.get(this).get(executionAsyncId())
	}
}
