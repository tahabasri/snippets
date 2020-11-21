import fs = require('fs');
import { Snippet } from '../interface/snippet';

export class DataAcess {

    encoding = 'utf8';

    dataFile: string;
    // data: any;

    constructor(private sourceParentPath: string) {
        if (!fs.existsSync(sourceParentPath)) {
            fs.mkdirSync(sourceParentPath);
            console.info("Data folder was initialized in : " + sourceParentPath);
        } else {
            console.info("Data folder already exists in path : " + sourceParentPath);
        }

        this.dataFile = sourceParentPath + '/data.json';
    }

    isBlank(str: string): boolean {
        return (!str || /^\s*$/.test(str));
    }
    

    readFile(): any {
        const defaultRootElement:Snippet = { id: 1, parentId: -1, label: 'snippets', lastId: 1, children: [] };
        // or '/Users/tbasri/dev/snippets/resources/data/data.json'
        if (!fs.existsSync(this.dataFile)) {
            console.info("Creating new file for future snippets in : " + this.dataFile);
            this.writeToFile(defaultRootElement);
        }
        console.info("Reading from file : " + this.dataFile);
        let rawdata = fs.readFileSync(this.dataFile, this.encoding);
        
        if (this.isBlank(rawdata)) {
            console.info("Creating new file for future snippets in : " + this.dataFile);
            this.writeToFile(defaultRootElement);
        }

        rawdata = fs.readFileSync(this.dataFile, this.encoding);
        return JSON.parse(rawdata);
    }

    writeToFile(data: Snippet): void {
        fs.writeFileSync(this.dataFile, JSON.stringify(data));
    }

}