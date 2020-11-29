import fs = require('fs');
import * as path from 'path';
import { Snippet } from '../interface/snippet';

export class DataAcess {
    private _encoding = 'utf8';
    private _dataFile: string;

    constructor(sourceParentPath: string) {
        if (!fs.existsSync(sourceParentPath)) {
            fs.mkdirSync(sourceParentPath);
            console.info("Data folder was initialized in : " + sourceParentPath);
        } else {
            console.info("Data folder already exists in path : " + sourceParentPath);
        }

        this._dataFile = path.join(sourceParentPath, 'data.json');
    }

    isBlank(str: string): boolean {
        return (!str || /^\s*$/.test(str));
    }
    

    readFile(): any {
        const defaultRootElement:Snippet = { id: 1, parentId: -1, label: 'snippets', lastId: 1, children: [] };
        if (!fs.existsSync(this._dataFile)) {
            console.info("Creating new file for future snippets in : " + this._dataFile);
            this.writeToFile(defaultRootElement);
        }
        console.info("Reading from file : " + this._dataFile);
        let rawData = fs.readFileSync(this._dataFile, this._encoding);
        
        if (this.isBlank(rawData)) {
            console.info("Creating new file for future snippets in : " + this._dataFile);
            this.writeToFile(defaultRootElement);
        }

        rawData = fs.readFileSync(this._dataFile, this._encoding);
        return JSON.parse(rawData);
    }

    writeToFile(data: Snippet): void {
        fs.writeFileSync(this._dataFile, JSON.stringify(data));
    }

}