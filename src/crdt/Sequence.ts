import {Char} from './Char';
const uuidv1 = require('uuid/v1');

export class Sequence {
    chars: Array<Char>;
    siteID: number;
    count: number;

    constructor() {
        this.chars = [];
        this.siteID = uuidv1();;
        this.count = 100;
        this.insert(0, 0, "bof", {});
        this.insert(10000, 10000, "eof", {});
    }

    generateIndex(indexStart: number, indexEnd: number) : number {
        let diff = (indexEnd - indexStart);
        let index;
        if (diff <= 10) {
            index = indexStart + diff/100;
        } else if (diff <= 1000) {
            index = Math.round(indexStart + diff/10);
        } else if (diff <= 5000) {
            index = Math.round(indexStart + diff/100);
        } else {
            index = Math.round(indexStart + diff/1000);
        }
        return index;
    }

    insert(indexStart: number, indexEnd: number, char: string, attributes: object, id?: string) : Char {
        //TODO: Must find better way here
        
        let index = this.generateIndex(indexStart, indexEnd);
        //let index = this.randomIntFromInterval(indexStart, indexEnd);
        let charObj = (id !== undefined) ? new Char(index, char, this.siteID, attributes, id) : new Char(index, char, this.siteID, attributes);

        this.chars.splice(index, 0, charObj);
        this.chars.sort(function(a,b) {
            return a.index - b.index;
        })
        return charObj;
    }

    remoteInsert(char: Char) {
        const charCopy = new Char(char.index, char.char, char.siteID, {bold: char.bold, italic: char.italic, underline: char.underline}, char.id);
        this.chars.push(charCopy);
        this.chars.sort(function(a,b) {
            if(a.index == b.index) {
                return a.siteID - b.siteID;
            } else {
                return a.index - b.index;

            }
        })
    }

    delete(id: string) {
        //console.log(id);
        let char = this.chars.find(e => e.id === id);
        if (char !== undefined) {
            char.tombstone = true;
            //console.log("removed: ", char)
        } else {
            //console.log("did not found char")
        }
    }

    remoteRetain(charCopy: Char) {
        let char = this.chars.find(c => c.id === charCopy.id);
        if (char !== undefined) {
            char.update({
                bold: charCopy.bold, italic: charCopy.italic, 
                underline: charCopy.underline, link: charCopy.link
            });
        }
    }

    getRelativeIndex(index: number): Array<Char> {
        //console.log("gri", index);
        let i = 0;
        let aliveIndex = 0;
        let itemsFound = false;
        let charStart; let charEnd; let char;
        while(!itemsFound && (i < this.chars.length)) {
            char = this.chars[i];
            //console.log(char);
            if(!char.tombstone) {
                //console.log(char, aliveIndex)
                if(aliveIndex>index) {
                    charEnd = char;
                    itemsFound = true;
                } else {
                    charStart = char;
                }
                aliveIndex++;
            }
            //console.log(index, aliveIndex, charStart, charEnd);
            i++;
        }
        if(aliveIndex>=index) {
            charEnd = char;
            itemsFound = true;
        } else {
            charStart = char;
        }
        if (charStart && charEnd)
            return [charStart, charEnd ];
        else
            throw Error("failedToFindRelativeIndex");
    }

    getCharRelativeIndex(char: Char) : number {
        let i = 0;
        let aliveIndex = 0;
        let charFound = false;
        let c;
        while(!charFound && (i < this.chars.length)) {
            c = this.chars[i];
            if(!c.tombstone && c.char !== "bof" && c.char !== "eof")
                aliveIndex++;
            if (c.id === char.id) {
                if (c.tombstone) {
                    aliveIndex++;
                }
                charFound = true;
            }
            i++;
        }
        if (charFound)
            return aliveIndex-1;
        else
            throw Error("failedToFindRelativeIndex");
    }

    getSequence(): string {
        let seq = "";
        for (let char of this.chars) {
            if (!char.tombstone && char.char !== "bof" && char.char !== "eof")
                seq += (char.char)
        }
        return seq;
    }

    pretty() {
        for (let char of this.chars) {
            console.log(char.index, char.char, char.siteID, char.tombstone);
        }

    }
}