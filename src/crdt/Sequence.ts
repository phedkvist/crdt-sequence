import {Char} from './Char';
const uuidv1 = require('uuid/v1');

export class Sequence {
    chars: Array<Char>;
    siteID: number;
    count: number;

    constructor() {
        this.chars = [];
        this.siteID = uuidv1();;
        this.count = 0;
        this.insert(0, 0, '');
        this.insert(100, 100, '');
    }

    insert(indexStart: number, indexEnd: number, char: string) {
        let diff = (indexEnd - indexStart);
        let index = indexStart + diff/2;
        let charObj = new Char(index, char, this.siteID);
        this.chars.splice(index, 0, charObj);
        this.chars.sort(function(a,b) {
            return a.index - b.index;
        })
        console.log(this.chars);
    }

    remoteInsert(char: Char) {
        this.chars.push(char);
        this.chars.sort(function(a,b) {
            if(a.index == b.index) {
                return a.siteID - b.siteID;
            } else {
                return a.index - b.index;

            }
        })
    }

    delete(index: number) {
        let char = this.chars.find(e => e.index == index);
        if (char !== undefined) {
            char.tombstone = true;
            console.log("removed: ", char)
        } else {
            console.log("did not found char")
        }
    }

    getRelativeIndex(index: number): Array<number> {
        let i = 0;
        let itemsFound = false;
        let charStart; let charEnd; let char;
        while(!itemsFound && (i < this.chars.length)) {
            char = this.chars[i];
            if(!char.tombstone) {
                if(i>index) {
                    charEnd = char;
                    itemsFound = true;
                } else {
                    charStart = char;
                }
            }
            if (!itemsFound) {
                i++;
            }
            //console.log(char, charStart, charEnd);
        }
        if (charStart && charEnd)
            return [charStart.index, charEnd.index];
        else
            throw Error("failedToFindRelativeIndex");
    }

    getSequence(): string {
        let seq = "";
        for (let char of this.chars) {
            if (!char.tombstone)
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