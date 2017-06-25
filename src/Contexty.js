import { createHook, executionAsyncId } from 'async_hooks'

let contexties = new Map()

export default class Contexty {
	constructor() {
		if (contexties.size === 0) {
			enableHook()
		}
		contexties.set(this, new Map())
	}
	get create() {
		let asyncId = executionAsyncId()
		let contexts = contexties.get(this)
		let context = Object.create(contexts.get(asyncId) || null)
		contexts.set(asyncId, context)
		return context
	}
	get context() {
		return contexties.get(this).get(executionAsyncId())
	}
}

function enableHook() {
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
