import { createHook, executionAsyncId } from 'async_hooks'

let asyncContexters = new Set()

createHook({
	init(asyncId, type, triggerAsyncId) {
		asyncContexters.forEach(asyncContexter => asyncContexter._contexts.set(asyncId, asyncContexter._contexts.get(triggerAsyncId)))
	},
	destroy(asyncId) {
		asyncContexters.forEach(asyncContexter => asyncContexter._contexts.delete(asyncId))
	},
}).enable()

export default class AsyncContexter {
	constructor() {
		this._contexts = new Map()
		asyncContexters.add(this)
	}
	new() {
		this._contexts.set(executionAsyncId(), Object.create(this._contexts.get(executionAsyncId()) || null))
	}
	get context() {
		return this._contexts.get(executionAsyncId())
	}
}
