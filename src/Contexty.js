import { createHook, executionAsyncId } from 'async_hooks'

let contexties = new Map()

export default class Contexty {
	constructor() {
		if (contexties.size === 0) {
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
		}
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
