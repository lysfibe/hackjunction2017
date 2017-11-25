const { MongoClient } = require('mongodb')

class Database {

	static get Database() { return Database }

	get _collection() {
		return this._connection.then(db => db.collection('demos'))
	}

	constructor() {
		this._connection = new Promise((resolve, reject) => {
			MongoClient.connect(env('db_url'), (err, db) => {
				if (err) reject(err)
				else resolve(db)
			})
		})
	}

	async insert(object) {
		const collection = await this._collection

		return new Promise((resolve, reject) => {
			const payload = Array.isArray(object) ? object : [object]
			collection.insertMany(payload, (err, r) => {
				if (err) reject(err)
				else resolve(r)
			})
		})
	}

	async find(query) {
		const collection = await this._collection

		return new Promise((resolve, reject) => {
			collection.find(query, (err, r) => {
				if (err) reject(err)
				else resolve(r.toArray())
			})
		})
	}
}

module.exports = new Database()