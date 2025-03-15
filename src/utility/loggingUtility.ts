import * as vscode from 'vscode';
import winston = require('winston');
import { LogOutputChannelTransport } from 'winston-transport-vscode';

/** The log levels are as follows:
 * error - 0
 * warn - 1
 * info - 2
 * debug - 3
 * trace - 4
 **/
export class LoggingUtility {

    // initialize singleton instance
    private static _instance: LoggingUtility = new LoggingUtility();
    private static logger: winston.Logger;

    private constructor() {
        if (LoggingUtility._instance) {
            throw new Error("Error: Instantiation failed: Use LoggingUtility.getInstance() instead of new.");
        }
        const outputChannel = vscode.window.createOutputChannel('Snippets', {
            log: true
        });;

        LoggingUtility.logger = winston.createLogger({
            level: 'trace', // Recommended: set the highest possible level
            levels: LogOutputChannelTransport.config.levels, // Recommended: use predefined VS Code log levels
            format: LogOutputChannelTransport.format(), // Recommended: use predefined format
            // workaround applied from https://github.com/open-telemetry/opentelemetry-js-contrib/issues/2015#issuecomment-2034163226
            // to fix issue https://github.com/loderunner/winston-transport-vscode/issues/116
            transports: [new LogOutputChannelTransport({ outputChannel: outputChannel }) as unknown as winston.transport]
          });

        LoggingUtility._instance = this;
    }

    public static getInstance(): LoggingUtility {
        return LoggingUtility._instance;
    }

    public error(str: string): void {
        LoggingUtility.logger.error(str);
    }

    public warn(str: string): void {
        LoggingUtility.logger.warn(str);
    }

    public info(str: string): void {
        LoggingUtility.logger.info(str);
    }

    public debug(str: string): void {
        LoggingUtility.logger.debug(str);
    }
}

    