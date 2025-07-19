"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_alias_1 = __importDefault(require("module-alias"));
const path_1 = __importDefault(require("path"));
const srcPath = __dirname.includes('/dist/')
    ? path_1.default.resolve(__dirname, '../../src')
    : path_1.default.resolve(__dirname, '..');
module_alias_1.default.addAliases({
    '@': srcPath
});
console.log('Module aliases registered with base path:', srcPath);
//# sourceMappingURL=module-alias.js.map