const redis = require('redis')
const moment = require('moment')

class Cache {
	static get Cache() { return Cache }

	constructor() {
		this.client = redis.createClient({ url: env('redis_url') })
		this._key = env('redis_key', 'junction_redis_value_')
	}

	_createKey(key) {
		return `${this.key}${key}`
	}

	async get(key) {
		return new Promise((resolve, reject) => {
			this.client.get(this._createKey(key), (err, value) => {
				if (err) reject(err)
				else resolve(value ? JSON.parse(value) : null)
			})
		})
	}

	async set(key, value) {
		return new Promise((resolve, reject) => {
			this.client.set(this._createKey(key), JSON.stringify(value), (err) => {
				if (err) reject(err)
				else resolve(true)
			})
		})
	}

	async remember(key, fn) {
		let value = await this.get(key)
		if (value == null) {
			value = await fn()
			await this.set(key, value)
		}
		return value
	}

	async rememberFor(key, time, fn) {
		let now = moment()
		let value = await this.get(key)
		if (value == null) {
			value = {
				until: moment(now).add(time, 'minutes'),
				data: await fn(),
			}

			await this.set(key, value)
			return value.data
		} else {
			const { until, data } = value
			if (moment(until).isSameOrBefore(now)) {
				value = {
					until: moment(now).add(time, 'minutes'),
					data: await fn()
				}

				await this.set(key, value)
				return value.data
			} else {
				return data
			}
		}
	}
}

module.exports = new Cache()