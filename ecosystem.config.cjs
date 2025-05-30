module.exports = {
	apps: [{
		name: 'resound',
		script: './.output/server/index.mjs',
		env: {
			PORT: 8081,
			NODE_ENV: 'production'
		}
	}]
}
