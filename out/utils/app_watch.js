"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_config_1 = __importDefault(require("./app_config"));
const transpilers_1 = require("./transpilers");
let busyCount = 0;
let allTfiles = [];
let allDfiles = [];
allTfiles.length = app_config_1.default.transpileConfigs.length;
allDfiles.length = app_config_1.default.transpileConfigs.length;
let transpilersStack = app_config_1.default.transpileConfigs
    .map((tconfig, index) => createWatcher(tconfig, index));
function createWatcher(tconfig, uid) {
    let transpilers = new transpilers_1.Transpilers(tconfig);
    transpilers.watchCBbusy = (tfiles, dfiles) => {
        busyCount++;
        allTfiles[uid] = tfiles;
        allDfiles[uid] = dfiles;
        printState();
    };
    transpilers.watchCBfree = () => {
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
    if (busyCount > 0) {
        let tcount = 0;
        let ttext = allTfiles.map((x) => {
            if (x && x.length > 0) {
                tcount += x.length;
                return x.join('\n') + '\n';
            }
            return '';
        }).join('');
        if (tcount > 0) {
            console.log(`\x1b[35m[Transpilando ${tcount} arquivos]\x1b[0m`);
            console.log(ttext);
        }
        let dcount = 0;
        let dtext = allDfiles.map((x) => {
            if (x && x.length > 0)
                dcount += x.length;
            return x.join('\n') + '\n';
            return '';
        }).join('');
        if (dcount > 0) {
            console.log(`\x1b[35m[Transpilando ${dcount} arquivos]\x1b[0m`);
            console.log(dtext);
        }
    }
    else {
        var errocount = transpilersStack.map((e) => e.errors.length).reduce((x, y) => x + y);
        if (errocount == 0) {
            console.log('\x1b[32m[Ok]\x1b[0m');
        }
        else {
            console.log(`\x1b[33m[Arquivos com erros: ${errocount}]\x1b[0m`);
            transpilersStack.forEach((e) => {
                transpilers_1.Transpilers.printFileErrors(e.errors);
            });
        }
    }
}
