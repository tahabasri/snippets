import fs = require('fs');
import * as path from 'path';
import { Snippet } from '../interface/snippet';

export class DataAccess {
    static dataFileExt = '.json';
    private static dataFileName = `data${DataAccess.dataFileExt}`;

    private _encoding = 'utf8';
    private _dataFile: string;

    constructor(dataFile: string) {
        this._dataFile = dataFile;
    }

    setDataFile(dataFile: string) {
        this._dataFile = dataFile;
    }

    isBlank(str: string): boolean {
        return (!str || /^\s*$/.test(str));
    }

    readFile(): any {
        const defaultRootElement:Snippet = { id: 1, parentId: -1, label: 'snippets', lastId: 1, children: [] };
        if (!fs.existsSync(this._dataFile)) {
            this.writeToFile(defaultRootElement);
        }
        let rawData = fs.readFileSync(this._dataFile, this._encoding);
        
        if (this.isBlank(rawData)) {
            this.writeToFile(defaultRootElement);
        }

        rawData = fs.readFileSync(this._dataFile, this._encoding);
        return JSON.parse(rawData);
    }

    writeToFile(data: Snippet): void {
        fs.writeFileSync(this._dataFile, JSON.stringify(data));
    }

    static resolveFilename(folderPath: string): string {
        return path.join(folderPath, DataAccess.dataFileName);
    }

}