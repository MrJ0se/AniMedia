import fs from 'fs';
import path from 'path';
import config from './app_config';

import {Transpilers,FileError,TranspilersConfig} from './transpilers';


deleteFolderContent(config.out)

{
	let npm_package_json = JSON.parse(fs.readFileSync(path.resolve(config.relative, './package.json'),'utf-8'));

	npm_package_json.main='index.js';
	if (npm_package_json.devDependencies)
		delete npm_package_json.devDependencies;

	npm_package_json.scripts = {
		'start':'cross-env NODE_ENV=production;node index.js'
	};

	fs.writeFileSync(path.resolve(config.out,'./package.json'),
		//null,2 é para formatar o JSON
		JSON.stringify(npm_package_json,null, 2)
	);
}

(async ()=>{
	for (var i = 0; i < config.transpileConfigs.length;i++) {
		let transpilers = new Transpilers(config.transpileConfigs[i] as TranspilersConfig);
		await transpilers.transpileAll(true);
		if (transpilers.errors.length>0) {
			console.log(`\x1b[33m[Arquivos com erros: ${transpilers.errors.length}]\x1b[0m`);
			Transpilers.printFileErrors(transpilers.errors);
			process.exit(0);
		}
	}
	console.log('\x1b[32m[Ok]\x1b[0m');
})();

function deleteFolderContent(folder:string) {
	fs.readdirSync(folder)
	.forEach((e)=>{
		e = path.resolve(folder,e);
		if (fs.statSync(e).isDirectory()) {
			deleteFolderContent(e);
			fs.rmdirSync(e);
		} else
			fs.unlinkSync(e);
	});
}