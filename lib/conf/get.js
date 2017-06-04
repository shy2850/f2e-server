const GLOBAL_CONF_NAME = 'GLOBAL_CONF_NAME'
const _ = require('lodash')
const path = require('path')
const fs = require('fs')

let all_config = {}

let get = (hostname='localhost', port) => {

	const key = `${hostname}:${port}`
	let conf = all_config[key]
	if (!conf) {
		const root = _.get(global[GLOBAL_CONF_NAME], [''+port, hostname])
		conf = {
			root,
		}

		const cfg_file = path.resolve(root, 'f2e-conf.js')
		if (fs.existsSync(cfg_file)) {
			const str = fs.readFileSync(cfg_file).toString()
			Object.assign(conf,
				new Function(
					'require',
				    '__dirname', 
					`var exports = {};
					${str};
					return exports;`
				)(require, root))
		}
		console.log(conf)
		all_config[key] = conf
	}
	return conf
}
get.GLOBAL_CONF_NAME = GLOBAL_CONF_NAME
module.exports = get