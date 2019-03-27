import { UserVersion } from './UserVersion';
import { Socket } from './Socket';
import { Sequence } from '../../src/crdt/Sequence';
import { Char } from '../../src/crdt/Char';
import { Cursor } from './Cursor';

export class History {
    sequence: Sequence;
    versionVector: Array<UserVersion>;
    cursors: Array<Cursor>;
    currentUserID: number;
    socket: Socket;
    remoteInsert: (index: number, char: Char) => void;
    remoteDelete: (index: number) => void;
    remoteRetain: (index: number, char: Char) => void;
    constructor(currentUserID: string, remoteInsert: (index: number, char: Char) => void, 
        remoteDelete: (index: number) => void, remoteRetain: (index: number, char: Char) => void) {

        this.socket = new Socket(this.remoteChange.bind(this), this.updateConnectionState.bind(this))
        this.sequence = new Sequence();
        this.versionVector = [];
        this.remoteInsert = remoteInsert;
        this.remoteDelete = remoteDelete;
        this.remoteRetain = remoteRetain;
    }

    updateConnectionState() {

    }

    insert(indexStart: number, indexEnd: number, char: string, attributes: object, source: string) {
        //console.log("insert: ", char, ", at: ", indexStart, ", source: ", source);
        if (source !== 'silent') {
            let charObj: Char = this.sequence.insert(indexStart, indexEnd, char, attributes);
            //console.log('insert');
            this.socket.send(JSON.stringify({type: 'insert', data: charObj}));
        }
    }

    delete(char: Char, source: string) {
        if (source !== 'silent') {
            this.sequence.delete(char.id);
            //console.log('delete sent now!');
            this.socket.send(JSON.stringify({type: 'delete', data: char}));
        }
    }

    retain(char: Char, attributes: object, source: string) {
        if (source !== 'silent') {
            char.update(attributes);
            this.socket.send(JSON.stringify({type: 'retain', data: char}));
            console.log("sent remote retain");
        }
    }

    getRelativeIndex(index: number): Array<Char> {
        return this.sequence.getRelativeIndex(index);
    }

    updateCursor(userID: string, startChar: Char, endChar: Char) {
        const relStartIndex = this.sequence.getCharRelativeIndex(startChar);
        const relEndIndex = this.sequence.getCharRelativeIndex(endChar);
        const len = relEndIndex - relStartIndex;
        console.log(len);
    }

    getCursors() : Array<Cursor> {
        return this.cursors;
    }

    remoteChange(jsonMessage: any) {
        //TODO: Validate data in jsonMessage
        let change = JSON.parse(jsonMessage);
        if (change.type === 'insert') {
            let char : Char = change.data;
            this.sequence.remoteInsert(char);
            let index = this.sequence.getCharRelativeIndex(char);
            console.log("remote ins", 'index: ',index, ', char: ', char);
            this.remoteInsert(index, char);
        } else if (change.type === 'delete') {
            let char : Char = change.data;
            let id : string = char.id;
            //console.log('delete', id);
            this.sequence.delete(id);
            try {
                let index = this.sequence.getCharRelativeIndex(char);
                console.log("remote del", 'index: ',index, ', char: ', char);
                this.remoteDelete(index);
            } catch (e) {
                console.log(e);
            }
        } else if (change.type === 'retain') {
            let char : Char = change.data;
            console.log("recieved remote retain");
            this.sequence.remoteRetain(char);
            try {
                let index = this.sequence.getCharRelativeIndex(char);
                console.log("remote retain", 'index: ',index, ', char: ', char);
                this.remoteRetain(index, char);
            } catch (e) {
                console.log(e);
            }
        } else if (change.type === 'cursor') {
            let userID = change.userID;
            let startChar = change.startChar;
            let endChar = change.endChar;
            this.updateCursor(userID, startChar, endChar);
        }
    }
}