import fetch from 'node-fetch'

// Authorization adapter
export var auth = (req, options, data, cb) => {
	if ( ! options.fetchUser) return cb()

	if (options.byToken === false) {
		return cb('Auth error: Only token authentication is supported.')
	}

	fetch(options.config.host + '/users', {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Token ' + req.auth.token,
		},
		timeout: options.timeout,
	})
		.catch((err) => cb('Auth error: ' + err.message))
		.then((res) => {
			if (res.status >= 200 && res.status < 300) return res.json()

			res.json().then((data) => cb('Auth error: ' + data.message))
		})
		.then((rows) => {
			if ( ! rows || ! rows[0]) return cb('Auth error: No user for token.')

			cb(null, rows[0])
		})
		.catch((err) => cb('Auth error: ' + err.message))
}

// Metadata adapter
var cache = {}

export var metadata = (req, options, data, { SensorAttribute }, cb) => {
	// Check cache
	var id = data.getDeviceId()
	var cached = cache[id]

	if (cached && cached.timestamp > Date.now() - options.cacheExpireTime) {
		data.setInfo(cached.info)
		data.setAttributes(cached.attributes)
		return cb()
	}

	// Query metadata
	const include = 'template.attributes.converters,' +
		'template.attributes.calibrators,' +
		'template.attributes.validators,' +
		'labels'

	fetch(options.config.host + '/devices?filter=udid:' + id + '&include=' + include, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Token ' + req.auth.token,
		},
		timeout: options.timeout,
	})
		.catch((err) => cb('Metadata error: ' + err.message))
		.then((res) => {
			if (res.status >= 200 && res.status < 300) return res.json()

			res.json().then((data) => cb('Metadata error: ' + data.message))
		})
		.then((rows) => {
			if ( ! rows[0] || ! rows[0].template || ! rows[0].template.attributes) {
				return cb('Metadata error: No metadata available for device ' + id)
			}

			// Create attributes
			var attributes = rows[0].template.attributes.map((row) => {
				var attr = new SensorAttribute(row.name)
				var { converters, calibrators, validators } = row

				converters && converters.forEach((row) => {
					attr.addConverter(row.type, row.value)
				})
				calibrators && calibrators.forEach((row) => {
					attr.addCalibrator(new Function(row.fn))
				})
				validators && validators.forEach((row) => {
					attr.addValidator(row.type, row.value)
				})

				return attr
			})

			// Create info object
			var info = {}
			var labels = rows[0].labels

			labels && labels.forEach((label) => {
				info[label.key] = label.value
			})

			info._id = id

			// Cache result
			cache[id] = { info, attributes, timestamp: Date.now() }

			// Done
			data.setAttributes(attributes)
			cb()
		})
		.catch((err) => cb('Metadata error: ' + err.message))
}


// Storage adapter
export var storage = (req, options, data, cb) => {
	var id = data.getInfo()._id

	fetch(options.config.host + '/devices/' + id + '/measurements', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Token ' + req.auth.token,
		},
		body: JSON.stringify(data.getData()),
		timeout: options.timeout,
	})
		.catch((err) => cb('Storage error: ' + err.message))
		.then((res) => {
			if (res.status >= 200 && res.status < 300) return cb()

			res.json().then((data) => cb('Storage error: ' + data.message))
		})
		.catch((err) => cb('Storage error: ' + err.message))
}
