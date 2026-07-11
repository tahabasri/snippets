import fs = require('fs');
import * as path from 'path';
import * as vscode from 'vscode';
import { Snippet } from '../interface/snippet';
import { DataAccess, DataAccessConsts } from './dataAccess';
import { Labels } from '../config/labels';
import { StringUtility } from '../utility/stringUtility';
import { LoggingUtility } from '../utility/loggingUtility';

export class FileDataAccess implements DataAccess {
    static dataFileExt = '.json';
    private static dataFileName = `data${FileDataAccess.dataFileExt}`;
    // notify about a given corrupted file only once per session
    private static notifiedCorruptFiles = new Set<string>();

    private _dataFile: string;
    private _recoverOnCorruption: boolean;

    /**
     * @param recoverOnCorruption only for persistent backends (e.g. `.vscode/snippets.json`):
     * an unparseable file is set aside as `*.corrupt-<timestamp>` and replaced with an empty
     * root so activation survives. Transient instances (import/export of arbitrary files)
     * must keep the default `false` so a bad import source is never overwritten.
     */
    constructor(dataFile: string, recoverOnCorruption = false) {
        this._dataFile = dataFile;
        this._recoverOnCorruption = recoverOnCorruption;
    }

    hasNoChild(): boolean {
        const rootElt = this.load();
        return rootElt.hasOwnProperty('children') && !rootElt.children || rootElt.children.length === 0;
    }

    setDataFile(dataFile: string) {
        this._dataFile = dataFile;
    }

    isBlank(str: string): boolean {
        return (!str || /^\s*$/.test(str));
    }

    load(): any {
        if (!fs.existsSync(this._dataFile)) {
            this.save(DataAccessConsts.defaultRootElement);
        }
        let rawData = fs.readFileSync(this._dataFile, { encoding: 'utf8' });

        if (this.isBlank(rawData)) {
            this.save(DataAccessConsts.defaultRootElement);
        }

        rawData = fs.readFileSync(this._dataFile, { encoding: 'utf8' });
        try {
            return JSON.parse(rawData);
        } catch (error) {
            if (!this._recoverOnCorruption) {
                throw error;
            }
            return this.recoverFromCorruptFile(error);
        }
    }

    /**
     * The data file exists but holds unparseable JSON (e.g. a write was interrupted before
     * atomic saves were introduced, or the file was edited by hand). Keep the unreadable
     * file next to the original, reseed an empty root, and tell the user where their data
     * went — dying during activation with a bare JSON.parse error loses both.
     */
    private recoverFromCorruptFile(error: unknown): Snippet {
        const backupPath = `${this._dataFile}.corrupt-${Date.now()}`;
        LoggingUtility.getInstance().error(`Corrupted snippets file (${this._dataFile}): ${error}`);
        fs.copyFileSync(this._dataFile, backupPath);
        this.save(DataAccessConsts.defaultRootElement);
        if (!FileDataAccess.notifiedCorruptFiles.has(this._dataFile)) {
            FileDataAccess.notifiedCorruptFiles.add(this._dataFile);
            vscode.window.showErrorMessage(
                StringUtility.formatString(Labels.snippetsFileCorrupted, this._dataFile, backupPath)
            );
        }
        return JSON.parse(fs.readFileSync(this._dataFile, { encoding: 'utf8' }));
    }

    save(data: Snippet): Promise<void> {
        // write-then-rename so a crash mid-write can never truncate the real data file
        const tmpFile = `${this._dataFile}.tmp`;
        fs.writeFileSync(tmpFile, JSON.stringify(data));
        fs.renameSync(tmpFile, this._dataFile);
        return Promise.resolve();
    }

    static resolveFilename(folderPath: string): string {
        return path.join(folderPath, FileDataAccess.dataFileName);
    }
}
