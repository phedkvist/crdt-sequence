export class Char {
    index: number;
    char: string;
    tombstone: boolean;
    siteID: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;

    constructor(index: number, char: string, siteID: number) {
        this.index = index;
        this.char = char;
        this.siteID = siteID;
        this.tombstone = false;
        this.bold = false;
        this.italic = false;
        this.underline = false;
    }
}