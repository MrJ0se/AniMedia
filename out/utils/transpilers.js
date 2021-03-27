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
exports.Transpilers = void 0;
const typescript_1 = __importDefault(require("typescript"));
const pug_1 = __importDefault(require("pug"));
const ejs_1 = __importDefault(require("ejs"));
const sass_1 = __importDefault(require("sass"));
const less_1 = __importDefault(require("less"));
//@ts-ignore
const webp_converter_1 = __importDefault(require("webp-converter"));
webp_converter_1.default.grant_permission();
const chokidar_1 = __importDefault(require("chokidar"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const WatchTimeout = 250;
;
class Transpilers {
    constructor(config) {
        this.errors = [];
        this.__watchPedentTranspiler = [];
        this.__watchPedentDelete = [];
        //Livre|Aguardando|Transpilando|Pendentes
        this.__watchState = "L";
        createDir(config.inputDir);
        this.config = config;
        this.configFilePath = path_1.default.resolve(this.config.inputDir, 'tsconfig.json');
        if (config.ts) {
            const configFile = typescript_1.default.findConfigFile(config.inputDir, typescript_1.default.sys.fileExists, 'tsconfig.json');
            if (!configFile)
                throw Error('tsconfig.json not found');
            this.tsConfig = typescript_1.default.readConfigFile(configFile, typescript_1.default.sys.readFile).config.compilerOptions;
            if (this.tsConfig) {
                this.tsConfig.rootDir = config.inputDir;
                this.tsConfig.outDir = config.outputDir;
                //@ts-ignore
                this.tsConfig.moduleResolution = (this.tsConfig.moduleResolution && this.tsConfig.moduleResolution == 'node') ? typescript_1.default.ModuleResolutionKind.NodeJs : typescript_1.default.ModuleResolutionKind.Classic;
            }
        }
    }
    static printFileErrors(errors) {
        errors.forEach((e) => {
            console.log(e.fullpath);
            console.log(e.errors.split('\n').map((e) => '  ' + e).join('\n'));
        });
    }
    //ignoreTime= transpilar ignorando o mtime dos arquivos de destino
    transpileAll(ignoreTime) {
        return __awaiter(this, void 0, void 0, function* () {
            this.errors = [];
            let fileNames = getFilesInfoFolder(this.config.inputDir);
            if (this.config.ts) {
                var ip = -1;
                for (let i = 0; i < fileNames.length; i++) {
                    if (fileNames[i].filepath == this.configFilePath) {
                        ip = i;
                        break;
                    }
                }
                if (ip >= 0)
                    fileNames.splice(ip, 1);
            }
            if (!ignoreTime) {
                //excluir da transpilação arquivos já transpilados depois da alteração do original
                /*
    
                falta implementar
    
                */
            }
            yield this.transpileFiles(fileNames.map((x) => x.filepath));
        });
    }
    __watchAddTraspiler(fpath) {
        if (this.config.ts && fpath == this.configFilePath)
            return;
        this.__watchPedentTranspiler.push(fpath);
        this.__watchAddEvent();
    }
    __watchAddDelete(fpath) {
        this.__watchPedentDelete.push(fpath);
        this.__watchAddEvent();
    }
    __watchAddEvent() {
        switch (this.__watchState) {
            case 'A':
                clearTimeout(this.__watchTimeoutVar);
                this.__watchTimeoutVar = setTimeout(() => this.__watchTimeout(), WatchTimeout);
                break;
            case 'L':
                this.__watchTimeoutVar = setTimeout(() => this.__watchTimeout(), WatchTimeout);
                this.__watchState = 'A';
                break;
            case 'T':
                this.__watchState = 'P';
        }
    }
    __watchTimeout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.__watchState = 'T';
            let tfiles = this.__watchPedentTranspiler;
            this.__watchPedentTranspiler = [];
            let dfiles = this.__watchPedentDelete;
            this.__watchPedentDelete = [];
            if (this.watchCBbusy)
                this.watchCBbusy(tfiles, dfiles);
            dfiles.forEach((e) => {
                e = this.translateToOutputPath(e);
                if (fs_1.default.existsSync(e))
                    fs_1.default.unlinkSync(e);
            });
            yield this.transpileFiles(tfiles);
            if (this.watchCBfree)
                this.watchCBfree();
            //@ts-ignore
            if (this.__watchState == 'P') {
                this.__watchTimeoutVar = setTimeout(() => this.__watchTimeout(), WatchTimeout);
                this.__watchState = 'A';
            }
            else
                this.__watchState = 'L';
        });
    }
    transpileWatchStart() {
        this.__watcher = chokidar_1.default.watch(this.config.inputDir);
        this.__watcher
            .on('add', (fpath) => {
            fpath = path_1.default.resolve(fpath);
            this.__watchAddTraspiler(fpath);
        })
            .on('change', (fpath) => {
            fpath = path_1.default.resolve(fpath);
            this.__watchAddTraspiler(fpath);
        })
            .on('unlink', (fpath) => {
            fpath = path_1.default.resolve(fpath);
            this.__watchAddDelete(fpath);
        });
    }
    transpileWatchEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.__watcher != undefined) {
                yield this.__watcher.close();
                this.__watcher = undefined;
            }
        });
    }
    translateToOutputPath(fpath) {
        if (this.tsConfig != undefined) {
            if (fpath.length >= 3 && fpath.substring(fpath.length - 3) == '.ts')
                return buildPath(fpath, this.config.inputDir, this.config.outputDir, '.js');
        }
        if (this.config.pug) {
            if (fpath.length >= 4 && fpath.substring(fpath.length - 4) == '.pug')
                return buildPath(fpath, this.config.inputDir, this.config.outputDir, '.pug');
        }
        if (this.config.ejs) {
            if (fpath.length >= 4 && fpath.substring(fpath.length - 4) == '.ejs')
                return buildPath(fpath, this.config.inputDir, this.config.outputDir, '.ejs');
        }
        if (this.config.sass) {
            if (fpath.length >= 5) {
                let frag = fpath.substr(fpath.length - 5);
                if (frag == '.scss' || frag == '.sass')
                    return buildPath(fpath, this.config.inputDir, this.config.outputDir, '.css');
            }
        }
        if (this.config.less) {
            if (fpath.length >= 5 && fpath.substring(fpath.length - 5) == '.less')
                return buildPath(fpath, this.config.inputDir, this.config.outputDir, '.less');
        }
        if (this.config.webp) {
            if (fpath.length >= 4) {
                let frag = fpath.substr(fpath.length - 4);
                if (frag == '.png' || frag == '.jpg' || frag == '.gif')
                    return buildPath(fpath, this.config.inputDir, this.config.outputDir, '.webp');
            }
        }
        if (this.config.copy)
            return buildPath2(fpath, this.config.inputDir, this.config.outputDir);
        return '';
    }
    transpileFiles(fileNames) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tsConfig != undefined) {
                this.errors.push(...compile_ts(fileNames
                    .filter((x) => x.length >= 3 &&
                    x.substr(x.length - 3) == '.ts'), this.config, this.tsConfig));
                fileNames = fileNames
                    .filter((x) => x.length < 3 ||
                    x.substr(x.length - 3) != '.ts');
            }
            if (this.config.pug) {
                this.errors.push(...compile_pug(fileNames
                    .filter((x) => x.length >= 4 &&
                    x.substr(x.length - 4) == '.pug'), this.config));
                fileNames = fileNames
                    .filter((x) => x.length < 4 ||
                    x.substr(x.length - 4) != '.pug');
            }
            if (this.config.ejs) {
                this.errors.push(...(yield compile_ejs(fileNames
                    .filter((x) => x.length >= 4 &&
                    x.substr(x.length - 4) == '.ejs'), this.config)));
                fileNames = fileNames
                    .filter((x) => x.length < 4 ||
                    x.substr(x.length - 4) != '.ejs');
            }
            if (this.config.sass) {
                this.errors.push(...compile_sass(fileNames
                    .filter((x) => {
                    if (x.length < 5)
                        return false;
                    let frag = x.substr(x.length - 5);
                    return frag == '.sass' || frag == '.scss';
                }), this.config));
                fileNames = fileNames
                    .filter((x) => {
                    if (x.length >= 5)
                        return true;
                    let frag = x.substr(x.length - 5);
                    return frag != '.sass' && frag != '.scss';
                });
            }
            if (this.config.less) {
                this.errors.push(...(yield compile_less(fileNames
                    .filter((x) => x.length >= 5 &&
                    x.substr(x.length - 5) == '.less'), this.config)));
                fileNames = fileNames
                    .filter((x) => x.length < 5 ||
                    x.substr(x.length - 5) != '.less');
            }
            if (this.config.webp) {
                this.errors.push(...(yield compile_webp(fileNames
                    .filter((x) => {
                    if (x.length < 4)
                        return false;
                    let frag = x.substr(x.length - 4);
                    return frag == '.png' || frag == '.jpg' || frag == '.gif';
                }), this.config)));
                fileNames = fileNames
                    .filter((x) => {
                    if (x.length >= 4)
                        return true;
                    let frag = x.substr(x.length - 4);
                    return frag != '.png' && frag != '.jpg' && frag != '.gif';
                });
            }
            if (this.config.copy) {
                fileNames.forEach((x) => {
                    let outfilename = buildPath2(x, this.config.inputDir, this.config.outputDir);
                    fs_1.default.copyFileSync(x, outfilename);
                });
            }
        });
    }
}
exports.Transpilers = Transpilers;
;
/*
* Utils
*/
function createDir(f) {
    if (fs_1.default.existsSync(f))
        return;
    createDir(path_1.default.resolve(f, '..'));
    fs_1.default.mkdirSync(f);
}
function buildPath(oldpath, olddir, newdir, newextension) {
    let dotp = oldpath.lastIndexOf('.');
    if (dotp <= oldpath.lastIndexOf(path_1.default.sep))
        dotp = oldpath.length;
    return newdir + oldpath.substring(olddir.length, dotp) + newextension;
}
function buildPath2(oldpath, olddir, newdir) {
    return newdir + oldpath.substring(olddir.length);
}
;
function getFilesInfoFolder(folder) {
    let ret = [];
    fs_1.default.readdirSync(folder)
        .forEach((e) => {
        e = path_1.default.resolve(folder, e);
        if (fs_1.default.statSync(e).isDirectory()) {
            ret.push(...getFilesInfoFolder(e));
        }
        else {
            const stats = fs_1.default.statSync(e);
            ret.push({
                filepath: e,
                last_time: stats.mtimeMs
            });
        }
    });
    return ret;
}
/*
* Conversões
*/
function compile_ts(fileNames, tconfig, options) {
    let program = typescript_1.default.createProgram(fileNames, options);
    let emitResult = program.emit(undefined, 
    //WriteFileCallback para evitar reescrever arquivos não alterados no HD
    (fileName, data) => {
        let oldfilename = buildPath(fileName, tconfig.outputDir, tconfig.inputDir, '.ts');
        //tconfig.inputDir+fileName.substring(tconfig.outputDir.length);
        //oldfilename = oldfilename.substring(0,oldfilename.length-3)+'.ts';
        if (fileNames.find((x) => x == oldfilename)) {
            createDir(path_1.default.resolve(fileName, '..'));
            fs_1.default.writeFileSync(fileName, data);
        }
    });
    let allDiagnostics = typescript_1.default
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);
    if (emitResult.emitSkipped)
        return [];
    let ret = [];
    allDiagnostics.forEach(diagnostic => {
        let erfile;
        let filename = '';
        if (diagnostic.file)
            filename = diagnostic.file.fileName;
        let temp = ret.find((x) => x.fullpath == filename);
        if (temp != null) {
            erfile = temp;
        }
        else {
            erfile = {
                fullpath: filename,
                errors: ''
            };
            ret.push(erfile);
        }
        if (diagnostic.file) {
            let { line, character } = typescript_1.default.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            let message = typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            erfile.errors += `(${line + 1},${character + 1}): ${message}\n`;
        }
        else {
            erfile.errors += typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, "\n") + '\n';
        }
    });
    return ret;
}
function compile_pug(fileNames, tconfig) {
    let ret = [];
    for (let i = 0; i < fileNames.length; i++) {
        try {
            let outfilename = buildPath(fileNames[i], tconfig.inputDir, tconfig.outputDir, '.html');
            createDir(path_1.default.resolve(outfilename, '..'));
            fs_1.default.writeFileSync(outfilename, pug_1.default.renderFile(fileNames[i]));
        }
        catch (e) {
            ret.push({
                fullpath: fileNames[i],
                errors: e + ''
            });
        }
    }
    return ret;
}
function compile_ejs(fileNames, tconfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let ret = [];
        for (let i = 0; i < fileNames.length; i++) {
            yield (new Promise((resolve) => {
                ejs_1.default.renderFile(fileNames[i], (err, str) => {
                    if (err) {
                        ret.push({
                            fullpath: fileNames[i],
                            errors: err + ''
                        });
                    }
                    else {
                        let outfilename = buildPath(fileNames[i], tconfig.inputDir, tconfig.outputDir, '.html');
                        createDir(path_1.default.resolve(outfilename, '..'));
                        fs_1.default.writeFileSync(outfilename, str);
                    }
                    resolve(0);
                });
            }));
        }
        return ret;
    });
}
function compile_sass(fileNames, tconfig) {
    let ret = [];
    for (let i = 0; i < fileNames.length; i++) {
        try {
            let r = sass_1.default.renderSync({ file: fileNames[i] });
            let outfilename = buildPath(fileNames[i], tconfig.inputDir, tconfig.outputDir, '.css');
            createDir(path_1.default.resolve(outfilename, '..'));
            fs_1.default.writeFileSync(outfilename, r.css);
        }
        catch (e) {
            let erstring = 'Invalid file';
            if (e.line && e.column && e.formatted) {
                erstring =
                    `(${e.line},${e.column}): ` +
                        e.formatted.substring(0, e.formatted.indexOf('\n')) + '\n';
            }
            ret.push({
                fullpath: fileNames[i],
                errors: erstring,
            });
        }
    }
    return ret;
}
function compile_less(fileNames, tconfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let ret = [];
        for (let i = 0; i < fileNames.length; i++) {
            yield (new Promise((resolve) => {
                less_1.default.render(fs_1.default.readFileSync(fileNames[i], 'utf-8'), { filename: fileNames[i] }, (e, out) => {
                    if (out) {
                        let outfilename = buildPath(fileNames[i], tconfig.inputDir, tconfig.outputDir, '.css');
                        createDir(path_1.default.resolve(outfilename, '..'));
                        fs_1.default.writeFileSync(outfilename, out.css);
                    }
                    else {
                        let erstring = 'Invalid file';
                        if (e.line && e.column && e.message)
                            erstring = `(${e.line},${e.column}): ` + e.message + '\n';
                        ret.push({
                            fullpath: fileNames[i],
                            errors: erstring,
                        });
                    }
                    resolve(0);
                });
            }));
        }
        return ret;
    });
}
function compile_webp(fileNames, tconfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let ret = [];
        for (let i = 0; i < fileNames.length; i++) {
            let outfilename = buildPath(fileNames[i], tconfig.inputDir, tconfig.outputDir, '.webp');
            createDir(path_1.default.resolve(outfilename, '..'));
            //@ts-ignore
            let result = yield webp_converter_1.default.cwebp(fileNames[i], outfilename, "-q " + tconfig.webpQuality);
            if (result != '') {
                ret.push({
                    fullpath: fileNames[i],
                    errors: result
                });
            }
        }
        return ret;
    });
}
