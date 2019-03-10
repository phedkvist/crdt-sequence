export class Socket {
    ws: WebSocket;
    connected: boolean;
    remoteChange: (string) => void;
	updateConnectionState: () => void;

    constructor(remoteChange: (string) => void, updateConnectionState: () => void) {
        this.onMessage = this.onMessage.bind(this);
		this.onClose = this.onClose.bind(this);
        this.onOpen = this.onOpen.bind(this);
        
        this.connect();
    }

    connect() {
        this.ws = new WebSocket('ws://localhost:8080/ws');
		this.ws.addEventListener('message', this.onMessage, false);
		this.ws.addEventListener('close', this.onClose, false);
		this.ws.addEventListener('open', this.onOpen, false);
    }

    disconnect() {
		this.ws.close();
		this.connected = false;
		this.updateConnectionState();
	}

	onMessage(e: any) {
		let jsonMessage = e.data;
        this.remoteChange(jsonMessage);
	}



	onClose(e: any) {
		console.log('disconnected');
		this.connected = false;
		this.updateConnectionState();
		/*
		var self = this;
		setTimeout(function() {
			self.connect();
		}, 10000);
		*/
	}

	onOpen(e: any) {
		this.connected = true;
		this.updateConnectionState();

		if (!this.hasLoadedInitialData) {
			this.getInitialMapData();
		} else {
			this.getMissedUpdates();
		}
	}
}