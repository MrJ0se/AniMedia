import cluster from 'cluster';
import os from 'os';
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import fs from 'fs';
import https from 'https';

if (process.env.NODE_ENV=='development') {
	run();
} else {
	if (cluster.isMaster) {
		const ncpus = os.cpus().length;
		console.log('iniciando cluster');

		for (let i = 0; i < ncpus; i++)
			cluster.fork();

		cluster.on('exit', (worker :cluster.Worker, code:number, signal:string) => {
			console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
			cluster.fork();
		});
	} else {
		run();
	}
}

//rredirecionar os usuario de http para https
function runRelay() {
	var app = express();

	app.use(helmet());
	app.use('*', function(req, res) {  
    	res.redirect('https://' + req.headers.host + req.url);
	});

	app.listen(80);
}

function run () {
	runRelay();
	var app = express();

	app.use(helmet());
	app.use(express.static(__dirname+'/public'));

	//iniciando para https
	var ssl = {
		key: fs.readFileSync(__dirname + '/ssl_temp.key'),
		cert: fs.readFileSync(__dirname + '/ssl_temp.crt')
	};
	var server = https.createServer(ssl, app);
	server.listen(443)
}