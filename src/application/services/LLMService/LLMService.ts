import { LLMRequestDTO, Provider } from "../../dtos/LLMRequestDTO";
import { currentTimestampAndDate } from "../../helpers/Utils";
import { MessageObserver, WebSocketServer } from "../WebSocketServer";
import { LLMRequestObserver, LLMRequestProcessingQueue } from "./LLMRequestProcessingQueue";
import { LLMResult } from "./LLMResult";
import { localLLMProcessingQueue } from "./processing/LocalLLMProcessingQueue";
import { openAiProcessingFunction } from "./processing/OpenAiProcessingFunction";
import { v4 as uuidv4 } from 'uuid';

export class LLMService {
    private openAiQueue = new LLMRequestProcessingQueue(openAiProcessingFunction)
    private localLLMQueue = new LLMRequestProcessingQueue(localLLMProcessingQueue)
    private wss: WebSocketServer

    constructor(wss: WebSocketServer) {
        this.wss = wss

        const incomeMessageProcessor: MessageObserver = {
            update: (message: any) => {
                const request = LLMRequestDTO.createFromObject(message)
                console.log(currentTimestampAndDate() + ` Received message: ${request.id}`);
                try {
                    // Validate the request fields
                    if (!request.system || !request.prompt || !request.provider || !request.model || !request.id) {
                        throw new Error("All fields are required");
                    }
                    this.enqueue(request);
                } catch (error: any) {
                    const requestId = request.id === undefined ? uuidv4() : request.id;
                    const result = new LLMResult(requestId, request, undefined, error.message);
                    this.wss.broadcastMessage(result)
                }
            }
        }

        const webSocketResultProcessor: LLMRequestObserver = {
            onRequestProcessed: (requestId: string, result: LLMResult) => {
                this.wss.broadcastMessage(result);
            }
        };

        this.wss.addMessageObserver(incomeMessageProcessor);
        this.openAiQueue.subscribe(webSocketResultProcessor)
        this.localLLMQueue.subscribe(webSocketResultProcessor)
    }

    enqueue(request: LLMRequestDTO): string {
        switch (request.provider) {
            case Provider.OpenAI:
                return this.openAiQueue.enqueue(request);
            case Provider.Local:
                return this.localLLMQueue.enqueue(request);
            default:
                throw new Error(`Provider ${request.provider} is not supported`);
        }
    }

    getResult(requestId: string): LLMResult | undefined {
        let result = this.openAiQueue.getResult(requestId)
        if (result === undefined) {
            result = this.localLLMQueue.getResult(requestId);
        }
        return result;
    }
}