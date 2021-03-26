"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
let relativep = path_1.default.resolve(__dirname, '../..');
exports.default = {
    relative: relativep,
    out: path_1.default.resolve(relativep, "./out/site"),
    transpileConfigs: [
        {
            inputDir: path_1.default.resolve(relativep, './src/copy'),
            outputDir: path_1.default.resolve(relativep, './out/site'),
            ts: false,
            pug: false,
            ejs: false,
            sass: false,
            less: false,
            webp: false,
            webpQuality: 80,
            copy: true,
        }, {
            inputDir: path_1.default.resolve(relativep, './src/tnode'),
            outputDir: path_1.default.resolve(relativep, './out/site'),
            ts: true,
            pug: false,
            ejs: false,
            sass: true,
            less: true,
            webp: true,
            webpQuality: 80,
            copy: true,
        }, {
            inputDir: path_1.default.resolve(relativep, './src/tweb'),
            outputDir: path_1.default.resolve(relativep, './out/site'),
            ts: true,
            pug: true,
            ejs: true,
            sass: true,
            less: true,
            webp: true,
            webpQuality: 80,
            copy: true,
        }
    ]
};
