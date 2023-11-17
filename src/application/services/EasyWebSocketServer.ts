import { dotEnv } from '../../config/Constants.js';
import { currentTimestampAndDate } from '../helpers/Utils.js';
import { WebSocketServer, WebSocket } from 'ws'
// Define an observer interface
export interface MessageObserver {
    update(message: any): void;
}

export class EasyWebSocketServer {
    private wss: WebSocketServer;
    private messageObservers: MessageObserver[] = [];
    private authorizedClients: Set<WebSocket> = new Set();

    constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.wss.on('connection', this.handleConnection);
    }

    // Make the server connection an async function that returns a promise
    public async connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.wss.on('listening', () => {
                console.log(currentTimestampAndDate() + ` LLMGateway WSS server is listening on port ${this.wss.options.port}`);
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
            console.log(currentTimestampAndDate() + " Client connected and authorized.");
            this.authorizedClients.add(socket);

            // Set up a ping interval for the new connection
            const pingInterval = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.ping();
                    // Set a timeout to close the connection if no pong response is received within 20 seconds
                    const pingTimeout = setTimeout(() => {
                        if (socket.readyState === WebSocket.OPEN) {
                            console.log(currentTimestampAndDate() + " No pong response received within 20 seconds. Closing the connection.");
                            socket.terminate(); // Close the connection
                        }
                    }, 3000); // Expect a pong response within 20 seconds

                    // Event handler for pong response
                    socket.once('pong', () => {
                        clearTimeout(pingTimeout); // Cancel the ping timeout
                    });
                }
            }, 30000); // Send a ping every 15 seconds

            // Event handler for incoming messages from authorized clients
            socket.on('message', (message: string) => {
                this.notifyObservers(JSON.parse(message));
            });

            // Event handler for client disconnection
            socket.on('close', () => {
                console.log(currentTimestampAndDate() + ' Client disconnected.');
                this.authorizedClients.delete(socket);
                clearInterval(pingInterval); // Clean up the ping interval when the client disconnects
            });
        } else {
            console.log(currentTimestampAndDate() + ' Client connection unauthorized. Closing connection.');
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