import { createHook, executionAsyncId } from 'async_hooks'

let contexties = new Map()

createHook({
	init(asyncId, type, triggerAsyncId) {
		for (let contexts of contexties.values()) {
			contexts.set(asyncId, contexts.get(triggerAsyncId))
		}
	},
	destroy(asyncId) {
		for (let contexts of contexties.values()) {
			contexts.delete(asyncId)
		}
	},
}).enable()

export default class Contexty {
	constructor() {
		contexties.set(this, new Map())
	}
	get new() {
		let asyncId = executionAsyncId()
		let contexts = contexties.get(this)
		let context = Object.create(contexts.get(asyncId) || null)
		contexts.set(asyncId, context)
		return context
	}
	get current() {
		return contexties.get(this).get(executionAsyncId())
	}
}
