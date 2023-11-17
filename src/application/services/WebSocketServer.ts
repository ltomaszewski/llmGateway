import WebSocket from 'ws';
import { dotEnv } from '../../config/Constants';

// Define an observer interface
export interface MessageObserver {
    update(message: any): void;
}

export class WebSocketServer {
    private wss: WebSocket.Server;
    private messageObservers: MessageObserver[] = [];
    private authorizedClients: Set<WebSocket> = new Set();

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

    private handleConnection = (socket: WebSocket, request: any) => {
        // Extract authentication token from the WebSocket request
        const token = request.headers['token'];

        // Perform authentication based on the token (you can use a more secure method)
        if (this.isValidAuthToken(token)) {
            console.log('Client connected and authorized.');
            this.authorizedClients.add(socket);

            // Event handler for incoming messages from authorized clients
            socket.on('message', (message: string) => {
                console.log(`Received message: ${message}`);
                this.notifyObservers(JSON.parse(message));
            });

            // Event handler for client disconnection
            socket.on('close', () => {
                console.log('Client disconnected.');
                this.authorizedClients.delete(socket);
            });
        } else {
            console.log('Client connection unauthorized. Closing connection.');
            socket.close();
        }
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

    private notifyObservers(message: any) {
        this.messageObservers.forEach((observer) => {
            observer.update(message);
        });
    }

    // Method to close the server
    public closeServer() {
        this.wss.close();
    }

    private isValidAuthToken(token: string | string[] | undefined): boolean {
        return token === dotEnv.WSS_AUTH_TOKEN;
    }
}