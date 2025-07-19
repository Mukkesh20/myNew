"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealthRoutes = registerHealthRoutes;
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger('Health');
function registerHealthRoutes(app) {
    app.get('/health', (req, res) => {
        logger.info('Health check request received');
        res.json({
            status: 'ok',
            version: process.env.npm_package_version || '1.0.0',
            serverTime: new Date().toISOString(),
            config: {
                servicenow: {
                    instanceUrl: config_1.config.servicenow.instanceUrl,
                    apiVersion: config_1.config.servicenow.apiVersion,
                }
            }
        });
    });
}
//# sourceMappingURL=health.js.map