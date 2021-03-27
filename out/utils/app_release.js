"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app_config_1 = __importDefault(require("./app_config"));
const transpilers_1 = require("./transpilers");
deleteFolderContent(app_config_1.default.out);
{
    let npm_package_json = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(app_config_1.default.relative, './package.json'), 'utf-8'));
    npm_package_json.main = 'index.js';
    if (npm_package_json.devDependencies)
        delete npm_package_json.devDependencies;
    npm_package_json.scripts = {
        'start': 'cross-env NODE_ENV=production node index.js'
    };
    fs_1.default.writeFileSync(path_1.default.resolve(app_config_1.default.out, './package.json'), 
    //null,2 é para formatar o JSON
    JSON.stringify(npm_package_json, null, 2));
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    for (var i = 0; i < app_config_1.default.transpileConfigs.length; i++) {
        let transpilers = new transpilers_1.Transpilers(app_config_1.default.transpileConfigs[i]);
        yield transpilers.transpileAll(true);
        if (transpilers.errors.length > 0) {
            console.log(`\x1b[33m[Arquivos com erros: ${transpilers.errors.length}]\x1b[0m`);
            transpilers_1.Transpilers.printFileErrors(transpilers.errors);
            process.exit(0);
        }
    }
    console.log('\x1b[32m[Ok]\x1b[0m');
}))();
function deleteFolderContent(folder) {
    fs_1.default.readdirSync(folder)
        .forEach((e) => {
        e = path_1.default.resolve(folder, e);
        if (fs_1.default.statSync(e).isDirectory()) {
            deleteFolderContent(e);
            fs_1.default.rmdirSync(e);
        }
        else
            fs_1.default.unlinkSync(e);
    });
}
