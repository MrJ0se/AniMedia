import fs from 'fs';
import path from 'path';
import config from './app_config';

import {Transpilers,FileError,TranspilersConfig} from './transpilers';

let busyCount = 0;
let allTfiles:string[][] = [];
let allDfiles:string[][] = [];

allTfiles.length = config.transpileConfigs.length;
allDfiles.length = config.transpileConfigs.length;

let transpilersStack = 
	config.transpileConfigs
	.map((tconfig,index)=>createWatcher(tconfig as TranspilersConfig,index));


function createWatcher(tconfig:TranspilersConfig, uid:number):Transpilers {
	let transpilers = new Transpilers(tconfig);
	transpilers.watchCBbusy = (tfiles:string[],dfiles:string[])=>{
		busyCount++;
		allTfiles[uid] = tfiles;
		allDfiles[uid] = dfiles;
		printState();
	};
	transpilers.watchCBfree = ()=>{
		busyCount--;
		allTfiles[uid].length = 0;
		allDfiles[uid].length = 0;
		printState();
	};
	transpilers.transpileWatchStart();
	return transpilers;
}

function printState() {
	console.clear();
	if (busyCount>0) {
		let tcount = 0;
		let ttext = allTfiles.map((x)=>{
			if(x&&x.length>0) {
				tcount += x.length;
				return x.join('\n')+'\n';
			}
			return '';
		}).join('');
		if (tcount>0) {
			console.log(`\x1b[35m[Transpilando ${tcount} arquivos]\x1b[0m`);
			console.log(ttext);
		}

		let dcount = 0;
		let dtext = allDfiles.map((x)=>{
			if(x&&x.length>0)
				dcount += x.length;
				return x.join('\n')+'\n';
			return '';
		}).join('');
		if (dcount>0) {
			console.log(`\x1b[35m[Transpilando ${dcount} arquivos]\x1b[0m`);
			console.log(dtext);
		}
	} else {
		var errocount = transpilersStack.map((e)=>e.errors.length).reduce((x,y)=>x+y);
		if (errocount == 0) {
			console.log('\x1b[32m[Ok]\x1b[0m');
		} else {
			console.log(`\x1b[33m[Arquivos com erros: ${errocount}]\x1b[0m`);
			transpilersStack.forEach((e)=>{
				Transpilers.printFileErrors(e.errors)
			});
		}
	}
}