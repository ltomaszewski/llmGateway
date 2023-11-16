import WebSocket from 'ws';

// Define an observer interface
export interface MessageObserver {
    update(message: any): void;
}


export class WebSocketServer {
    private wss: WebSocket.Server;
    private messageObservers: MessageObserver[] = [];

    constructor(port: number) {
        this.wss = new WebSocket.Server({ port });
        this.wss.on('connection', this.handleConnection);
    }

    // Make the server connection an async function that returns a promise
    public async connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.wss.on('listening', () => {
                console.log(`WebSocket server is listening on port ${this.wss.options.port}`);
                resolve();
            });

            this.wss.on('error', (error) => {
                reject(error);
            });
        });
    }

    private handleConnection = (socket: WebSocket) => {
        console.log('Client connected.');

        // Event handler for incoming messages from clients
        socket.on('message', (message: string) => {
            console.log(`Received message: ${message}`);

            // Notify all registered observers with the received message
            this.messageObservers.forEach((observer) => {
                observer.update(JSON.parse(message));
            });
        });

        // Event handler for client disconnection
        socket.on('close', () => {
            console.log('Client disconnected.');
        });
    };


    // Modify sendMessage to accept message as any and convert it to JSON
    public sendMessage(clientSocket: WebSocket, message: any) {
        clientSocket.send(JSON.stringify(message));
    }

    // Modify broadcastMessage to accept message as any and convert it to JSON
    public broadcastMessage(message: any) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    // Method to add a message observer
    public addMessageObserver(observer: MessageObserver) {
        this.messageObservers.push(observer);
    }

    // Method to close the server
    public closeServer() {
        this.wss.close();
    }
}