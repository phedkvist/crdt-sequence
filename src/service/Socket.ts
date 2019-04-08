export default class Socket {
    ws: WebSocket;
    connected: boolean;
    remoteChange: (json: string) => void;
	updateConnectionState: () => void;

    constructor(remoteChange: (json: string) => void, updateConnectionState: () => void) {
        this.onMessage = this.onMessage.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.remoteChange = remoteChange;
		this.updateConnectionState = updateConnectionState;
        
        this.connect();
    }

    connect() {
		if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
			this.ws = new WebSocket('ws://localhost:5000');
		} else {
			this.ws = new WebSocket('wss://boiling-castle-92688.herokuapp.com');
		}
		this.ws.addEventListener('message', this.onMessage, false);
		this.ws.addEventListener('close', this.onClose, false);
		this.ws.addEventListener('open', this.onOpen, false);
    }

    disconnect() {
		this.ws.close();
		this.connected = false;
		this.updateConnectionState();
	}

	send(jsonMessage: string) {
		this.ws.send(jsonMessage);
	}

	onMessage(e: any) {
		let jsonMessage = e.data;
        this.remoteChange(jsonMessage);
	}

	onClose(e: any) {
		this.connected = false;
		this.updateConnectionState();
	}

	onOpen(e: any) {
		this.connected = true;
		this.updateConnectionState();
		console.log('connected');
		this.send(JSON.stringify({type: 'request_init_load'}));
	}
}