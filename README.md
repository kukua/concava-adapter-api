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
	// [optional] Authentication is done in every adapter,
	// so the auth adapter only provides req.user.
	auth: {
		method: adapter.auth,
		config: config,
	},
	metadata: {
		method: adapter.metadata,
		config: config,
	},
	storage: {
		method: adapter.storage,
		config: config,
	},
}
```

## License

This software is licensed under the [MIT license](https://github.com/kukua/concava-adapter-api/blob/master/LICENSE).

© 2016 Kukua BV
