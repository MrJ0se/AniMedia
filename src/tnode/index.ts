import cluster from 'cluster';
import os from 'os';
import express from 'express';
import bodyParser from 'body-parser';


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

function run () {
	var app = express();

	app.use(express.static(__dirname+'/public'));

	app.listen(80);
}