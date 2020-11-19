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
        }else{
            console.info("Data folder already exists in path : " + sourceParentPath);
        }

        this.dataFile = sourceParentPath + '/data.json';
        
        // this.data = this.readFile();
        // if (this.data) {
        //     console.info("Data has been retrieved");
        // }
    }

    readFile(): any {
        // or '/Users/tbasri/dev/snippets/resources/data/data.json'
        if(!fs.existsSync(this.dataFile)){
            console.info("Creating new file for future snippets in : " + this.dataFile);
            this.writeToFile({label:'snippets', children: []});
        }
        console.info("Reading from file : " + this.dataFile);
        let rawdata = fs.readFileSync(this.dataFile, this.encoding);
        return JSON.parse(rawdata);
    }

    writeToFile(data: Snippet): void {
        fs.writeFileSync(this.dataFile, JSON.stringify(data));
    }

}