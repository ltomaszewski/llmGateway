import { LLMRequestDTO } from "../../dtos/LLMRequestDTO.js";
import { v4 as uuidv4 } from 'uuid';
import { LLMResult } from "./LLMResult.js";
import { currentTimestampAndDate } from "../../helpers/Utils.js";

type ProcessingFunction = (request: LLMRequestDTO) => Promise<void>;

export interface LLMRequestObserver {
    onRequestProcessed: (requestId: string, result: LLMResult) => void;
}

export class LLMRequestProcessingQueue {
    private observers: LLMRequestObserver[] = []; // Array to hold observers
    private queue: any[] = [];
    private maxConcurrent: number = 2; // Max number of concurrent operations
    private processingFunction: ProcessingFunction;
    private currentlyProcessing: number = 0;
    public processingTimeout: number = 30000; // 30 seconds timeout, can be changed
    private results: Map<string, any> = new Map(); // Store results with requestId as key

    constructor(processingFunction?: ProcessingFunction, maxConcurrent: number = 5) {
        this.maxConcurrent = maxConcurrent;
        this.processingFunction = processingFunction || this.defaultProcessingFunction;
    }

    enqueue(request: LLMRequestDTO): string {
        const requestId = request.id === undefined ? uuidv4() : request.id;
        this.queue.push({ request, requestId });
        this.tryProcessNext();
        return requestId;
    }

    getResult(requestId: string): LLMResult | undefined {
        if (this.results.has(requestId)) {
            const result = this.results.get(requestId);
            this.results.delete(requestId);  // Remove the result after fetching
            return result;
        }
        return undefined; // Indicate that the result is not available (either not yet processed or already fetched)
    }

    // Method to subscribe an observer
    subscribe(observer: LLMRequestObserver): void {
        this.observers.push(observer);
    }

    // Method to unsubscribe an observer
    unsubscribe(observer: LLMRequestObserver): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    // Method to notify all observers
    notifyObservers(requestId: string, result: LLMResult): void {
        this.observers.forEach(observer => observer.onRequestProcessed(requestId, result));
    }

    private tryProcessNext() {
        if (this.queue.length > 0 && this.currentlyProcessing < this.maxConcurrent) {
            const request = this.queue.shift();
            if (request) {
                const requestId = request.requestId;
                this.currentlyProcessing++;
                this.processWithTimeout(request.request, requestId)
                    .then((result) => {
                        const llmResult = new LLMResult(requestId, request, result, undefined)
                        this.results.set(requestId, llmResult);
                        this.notifyObservers(requestId, llmResult);
                        console.log(currentTimestampAndDate() + ` Processed: ${requestId}`);
                        this.currentlyProcessing--;
                        this.tryProcessNext();
                    })
                    .catch(error => {
                        console.error(currentTimestampAndDate() + ` Error processing request: ${error}`);
                        const llmResult = new LLMResult(requestId, request, undefined, error.toString())
                        this.results.set(requestId, llmResult);
                        this.notifyObservers(requestId, llmResult);
                        this.currentlyProcessing--;
                        this.tryProcessNext();
                    });
            }
        }
    }

    private async processWithTimeout(request: LLMRequestDTO, requestId: number): Promise<any> {
        const timeoutPromise = new Promise<any>((_, reject) => {
            setTimeout(() => reject(new Error('Processing timed out')), this.processingTimeout);
        });

        return Promise.race([
            this.processingFunction(request),
            timeoutPromise
        ]);
    }

    private async defaultProcessingFunction(request: LLMRequestDTO): Promise<any> {
        // Default processing logic
        console.log(currentTimestampAndDate() + ` Processing request: ${JSON.stringify(request)}`);
        return new Promise(resolve => setTimeout(() => resolve(`Processed: ${JSON.stringify(request)}`), 3000));
    }
}