const express = require('express');
const fs = require('fs');
const path = require('path');

const out_path = path.resolve('../out');
const in_copy_path = 
	path.resolve('../src/copy');
const in_transpile_path = 
	path.resolve('../src/web-transpile');


function hasExtension(x,extension) {
	return x.length>extension.length && x.substring(x.length-extension.length) == extension;
}

//transpiler
const transpile_extensions = [
	['.js','.ts']
];
const ts = require('typescript');
function transpile(filepath, res) {
	var file_src = fs.readFileSync(filepath,'utf-8');
	if (hasExtension(filepath, '.ts')) {
		file_src = ts.transpileModule(file_src,{
			'compilerOptions':{
				'target': 'es6',
				'module': ts.ModuleKind.CommonJS,
				'strict': true,
				'skipDefaultLibCheck': true,

			}
		});
		res.type('.js');
	}
	res.send(file_src);
}

//implantar o monkey path no express.static() e no res.sendFile();
const original_express_static = express.static;
express.static = function(ref_path) {
	var static_mid = original_express_static(ref_path);

	var copy_path_eqv = in_copy_path + path.resolve(ref_path).substring(out_path);
	var transpile_path_eqv = in_transpile_path + path.resolve(ref_path).substring(out_path);
	return function (req, res, next) {
		var relative_path = req.path.substring(req.baseUrl.length);

		//procurar na pasta copy...
		var possible_path = copy_path_eqv+relative_path;
		if (fs.existsSync(possible_path)) {
			res.sendFile(possible_path);
			return;
		}

		//procurar por arquivos que possam ser transpilados com caminho equivalente no /src/web-transpile...
		for (var i = 0;i < transpile_extensions.length;i++) {
			if (hasExtension(relative_path, transpile_extensions[i][0])) {
				for (var i2 = 1; i2 < transpile_extensions[i].length;i2++) {
					possible_path = 
						transpile_path_eqv+
						relative_path.substring(0,relative_path.length - transpile_extensions[i][0].length)+
						transpile_extensions[i][i2];
					if (fs.existsSync(possible_path)) {
						transpile(possible_path, res);
						return;
					}
				}
			}
		}

		//caso falhe... continuar para o middleware static original
		static_mid(req,res,()=>{
			//implantar um monkey path no sendFile, depois que passar pelo middleware
			res._original_sendFile = res.sendFile;
			res.sendFile = monkeyPath_sendFile;
			next();
		});
	}
}

function monkeyPath_sendFile (filepath) {
	if (filepath.length>out_path.length && filepath.substring(out_path.length) == out_path) {
		var relative_path = filepath.substring(out_path.length);

		var possible_path = in_copy_path + relative_path;
		if (fs.existsSync(possible_path))
			return this._original_sendFile(possible_path);

		for (var i = 0;i < transpile_extensions.length;i++) {
			if (hasExtension(relative_path, transpile_extensions[i][0])) {
				for (var i2 = 1; i2 < transpile_extensions[i].length;i2++) {
					possible_path = 
						in_copy_path+
						relative_path.substring(0,relative_path.length - transpile_extensions[i][0].length)+
						transpile_extensions[i][i2];
					if (fs.existsSync(possible_path)) {
						transpile(possible_path, this);
						return;
					}
				}
			}
		}
	}
	return this._original_sendFile(filepath);
}

//iniciar o servidor com o monkey-path
require('../out/index.js')