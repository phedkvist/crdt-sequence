import UserVersion from './UserVersion';
import Socket from './Socket';
import Sequence from '../../src/crdt/Sequence';
import Char from '../../src/crdt/Char';
import Cursor from './Cursor';

const CURSOR = 'cursor';
const INSERT = 'insert';
const DELETE = 'delete';
const RETAIN = 'retain';
const SILENT = 'silent';

export default class History {
    sequence: Sequence;
    versionVector: Array<UserVersion>;
    cursors: Array<Cursor>;
    localCursor: Cursor;
    currentUserID: number;
    socket: Socket;
    remoteInsert: (index: number, char: Char) => void;
    remoteDelete: (index: number) => void;
    remoteRetain: (index: number, char: Char) => void;
    updateRemoteCursors: (cursor: Cursor) => void;
    constructor(currentUserID: string, remoteInsert: (index: number, char: Char) => void, 
        remoteDelete: (index: number) => void, remoteRetain: (index: number, char: Char) => void,
        updateRemoteCursors: (cursor: Cursor) => void) {

        this.socket = new Socket(this.remoteChange.bind(this), this.updateConnectionState.bind(this))
        this.sequence = new Sequence();
        this.cursors = [];
        this.localCursor = new Cursor(currentUserID, 1, 0, this.cursors.length);
        this.versionVector = [];
        this.remoteInsert = remoteInsert;
        this.remoteDelete = remoteDelete;
        this.remoteRetain = remoteRetain;
        this.updateRemoteCursors = updateRemoteCursors;
    }

    updateConnectionState() {

    }

    insert(indexStart: number, indexEnd: number, char: string, attributes: object, source: string) {
        if (source !== SILENT) {
            console.log('history insert: ', indexStart, indexEnd, char);
            let charObj: Char = this.sequence.insert(indexStart, indexEnd, char, attributes);
            this.socket.send(JSON.stringify({type: INSERT, data: charObj}));
        }
    }

    delete(char: Char, source: string) {
        if (source !== SILENT) {
            this.sequence.delete(char.id);
            this.socket.send(JSON.stringify({type: DELETE, data: char}));
        }
    }

    retain(char: Char, attributes: object, source: string) {
        if (source !== SILENT) {
            char.update(attributes);
            this.socket.send(JSON.stringify({type: RETAIN, data: char}));
        }
    }

    getRelativeIndex(index: number): Array<Char> {
        return this.sequence.getRelativeIndex(index);
    }

    updateRemoteCursor(remoteCursor: Cursor) {
        let cursor = this.cursors.find(c => c.userID === remoteCursor.userID);
        if (cursor) {
            cursor.updateRange(remoteCursor.index, remoteCursor.length);
        } else {
            cursor = new Cursor(remoteCursor.userID, remoteCursor.index,
                remoteCursor.length, this.cursors.length);
            this.cursors.push(cursor);
        }
        this.updateRemoteCursors(cursor);
    }

    updateCursor(index: number, length: number) {
        this.localCursor.updateRange(index, length);
        this.socket.send(JSON.stringify({type: CURSOR, data: this.localCursor}))
    }

    getCursors() : Array<Cursor> {
        return this.cursors;
    }

    remoteChange(jsonMessage: any) {
        //TODO: Validate data in jsonMessage
        let change = JSON.parse(jsonMessage);
        if (change.type === INSERT) {
            let char : Char = change.data;
            this.sequence.remoteInsert(char);
            let index = this.sequence.getCharRelativeIndex(char);
            this.remoteInsert(index, char);
        } else if (change.type === DELETE) {
            let char : Char = change.data;
            let id : string = char.id;
            this.sequence.delete(id);
            try {
                let index = this.sequence.getCharRelativeIndex(char);
                this.remoteDelete(index);
            } catch (e) {
            }
        } else if (change.type === RETAIN) {
            let char : Char = change.data;
            this.sequence.remoteRetain(char);
            try {
                let index = this.sequence.getCharRelativeIndex(char);
                this.remoteRetain(index, char);
            } catch (e) {
            }
        } else if (change.type === CURSOR) {
            let remoteCursor : Cursor = change.data;
            this.updateRemoteCursor(remoteCursor);
        }
    }
}