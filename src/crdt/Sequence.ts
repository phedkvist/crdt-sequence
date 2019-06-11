import Char from './Char';
const uuidv1 = require('uuid/v1');

export default class Sequence {
    chars: Array<Char>;
    siteID: number;
    count: number;

    constructor() {
        this.chars = [new Char(0, "bof", this.siteID, {}), new Char(10000, "eof", this.siteID, {})];
        this.siteID = uuidv1();
        this.count = 100;
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

    compareIdentifier(c1: Char, c2: Char) {
        if (c1.index < c2.index) {
            return -1;
        } else if (c1.index > c2.index) {
            return 1;
        } else {
            if (c1.siteID < c2.siteID) {
                return -1;
            } else if (c1.siteID > c2.siteID) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    insert(indexStart: number, indexEnd: number, char: string, attributes: object, id?: string) : Char {
        //TODO: Must find better way here
        
        let index = this.generateIndex(indexStart, indexEnd);
        console.log('Insert index:', index);
        //let index = this.randomIntFromInterval(indexStart, indexEnd);
        let charObj = (id !== undefined) ? new Char(index, char, this.siteID, attributes, id) : new Char(index, char, this.siteID, attributes);
        /*
        for (let i = 0; i < this.chars.length; i++) {
            let c = this.chars[i];
            const compareIdentifier = this.compareIdentifier(charObj, c);
            console.log('comparing: ', charObj, c, ' outcome: ', compareIdentifier);
            if (compareIdentifier === -1 || compareIdentifier === 0) {
                console.log('inserting ', char,  'at: ', i);
                this.chars.splice(i, 0, charObj);
                break;
            }
        }
        */
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
        let i = 0;
        let aliveIndex = 0;
        let itemsFound = false;
        let charStart; let charEnd; let char;
        while(!itemsFound && (i < this.chars.length)) {
            char = this.chars[i];
            if(!char.tombstone) {
                if(aliveIndex>index) {
                    charEnd = char;
                    itemsFound = true;
                } else {
                    charStart = char;
                }
                aliveIndex++;
            }
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