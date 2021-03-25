const fs = require('fs');

var package = JSON.parse(fs.readFileSync('../package-lock.json','utf-8'));

package.main='index.js';
delete package.devDependencies;

package.scripts = {
	'start':'cross-env NODE_ENV=production;node index.js'
};

fs.writeFileSync('../out/package-lock.json',
	//null,2 é para formatar o JSON
	JSON.stringify(package,null, 2)
);