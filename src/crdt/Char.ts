const uuidv1 = require('uuid/v1');

export class Char {
    index: number;
    char: string;
    tombstone: boolean;
    siteID: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    id: string;

    constructor(index: number, char: string, siteID: number, id: string = uuidv1()) {
        this.index = index;
        this.char = char;
        this.siteID = siteID;
        this.tombstone = false;
        this.bold = false;
        this.italic = false;
        this.underline = false;
        this.id = id;
    }
}