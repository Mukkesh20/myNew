"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
try {
    const moduleAlias = require('module-alias');
    const basePath = path_1.default.resolve(__dirname, '..');
    moduleAlias.addAliases({
        '@': __dirname
    });
    console.log('TypeScript path aliases registered:', {
        '@': __dirname
    });
}
catch (err) {
    console.error('Failed to register path aliases:', err);
    console.error('Make sure you have installed module-alias: npm install --save module-alias');
}
//# sourceMappingURL=register-paths.js.map