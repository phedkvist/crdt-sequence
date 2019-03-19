const uuidv1 = require('uuid/v1');

export class Char {
    index: number;
    char: string;
    tombstone: boolean;
    siteID: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    header: string;
    id: string;

    constructor(index: number, char: string, siteID: number, attributes: object, id: string = uuidv1()) {
        this.index = index;
        this.char = char;
        this.siteID = siteID;
        this.tombstone = false;
        this.bold = attributes !== undefined && "bold" in attributes ? attributes["bold"] : false;
        this.italic = attributes !== undefined && "italic" in attributes ? attributes["italic"] : false;
        this.underline = attributes !== undefined && "underline" in attributes ? attributes["underline"] : false;
        this.header = attributes !== undefined && "header" in attributes ? attributes["header"] : null;
        this.id = id;
    }
}