import { LMMRequestDTO } from "../dtos/LMMRequestDTO";
import { v4 as uuidv4 } from 'uuid';

type ProcessingFunction = (request: LMMRequestDTO) => Promise<void>;

export class LLMRequestProcessingQueue {
    private queue: any[] = [];
    private maxConcurrent: number = 5; // Max number of concurrent operations
    private processingFunction: ProcessingFunction;
    private currentlyProcessing: number = 0;
    public processingTimeout: number = 15000; // 5 seconds timeout, can be changed
    private results: Map<number, any> = new Map(); // Store results with requestId as key

    constructor(processingFunction?: ProcessingFunction, maxConcurrent: number = 5) {
        this.maxConcurrent = maxConcurrent;
        this.processingFunction = processingFunction || this.defaultProcessingFunction;
    }

    enqueue(request: LMMRequestDTO): string {
        const requestId = uuidv4(); // Generate a UUID for the request
        this.queue.push({ request, requestId });
        this.tryProcessNext();
        return requestId;
    }

    getResult(requestId: number): any {
        if (this.results.has(requestId)) {
            const result = this.results.get(requestId);
            this.results.delete(requestId);  // Remove the result after fetching
            return result;
        }
        return null; // Indicate that the result is not available (either not yet processed or already fetched)
    }

    private tryProcessNext() {
        if (this.queue.length > 0 && this.currentlyProcessing < this.maxConcurrent) {
            const request = this.queue.shift();
            if (request) {
                const requestId = request.requestId;
                this.currentlyProcessing++;
                this.processWithTimeout(request.request, requestId)
                    .then((result) => {
                        console.log(`Processed: ${requestId}`);
                        this.results.set(requestId, { request, result });
                        this.currentlyProcessing--;
                        this.tryProcessNext();
                    })
                    .catch(error => {
                        this.results.set(requestId, { request, error: error.toString() });
                        console.error(`Error processing request: ${error}`);
                        this.currentlyProcessing--;
                        this.tryProcessNext();
                    });
            }
        }
    }

    private async processWithTimeout(request: LMMRequestDTO, requestId: number): Promise<any> {
        const timeoutPromise = new Promise<any>((_, reject) => {
            setTimeout(() => reject(new Error('Processing timed out')), this.processingTimeout);
        });

        return Promise.race([
            this.processingFunction(request),
            timeoutPromise
        ]);
    }

    private async defaultProcessingFunction(request: LMMRequestDTO): Promise<any> {
        // Default processing logic
        console.log(`Processing request: ${JSON.stringify(request)}`);
        return new Promise(resolve => setTimeout(() => resolve(`Processed: ${JSON.stringify(request)}`), 5000));
    }
}
