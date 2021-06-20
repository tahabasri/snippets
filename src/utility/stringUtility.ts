export class StringUtility {
    static formatString(str: string, ...val: string[]) : string {
        for (let index = 0; index < val.length; index++) {
            str = str.replace(`{${index}}`, val[index]);
        }
        return str;
    }

    static isBlank(str: string) : boolean {
        return (!str || /^\s*$/.test(str));
    }
}