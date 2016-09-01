# ConCaVa MySQL adapter

> ConCaVa adapter for authorization, metadata and storage through the ConCaVa API.

Requires ConCaVa v0.7+.

## Install

```bash
npm install concava-adapter-api
```

## Configure

A ConCaVa configuration example:

```js
const adapter = require('concava-adapter-api')

// Connection configuration
var config = {
	host: 'https://api.example.com/v1',
	timeout: 3000, // ms
}

module.exports = {
	debug: true,
	auth: {
		enabled: true, // Required for parsing the auth header
		method: adapter.auth,
		config: config,
		fetchUser: false, // Fetch user entity
	},
	metadata: {
		method: adapter.metadata,
		config: config,
		cacheExpireTime: 15 * 60 * 1000, // ms
	},
	storage: {
		method: adapter.storage,
		config: config,
	},
}
```

**Note:** Besides the device labels, the metadata adapter adds an `_id` to `data.getInfo()`.
This ConCaVa API device ID is required by the storage adapter.

## License

This software is licensed under the [MIT license](https://github.com/kukua/concava-adapter-api/blob/master/LICENSE).

© 2016 Kukua BV
