import { LMMRequestDTO, Provider } from "../../dtos/LMMRequestDTO";
import { LLMRequestProcessingQueue } from "./LLMRequestProcessingQueue";
import { LLMResult } from "./LLMResult";
import { localLLMProcessingQueue } from "./processing/LocalLLMProcessingQueue";
import { openAiProcessingFunction } from "./processing/OpenAiProcessingFunction";


export class LLMService {
    private openAiQueue = new LLMRequestProcessingQueue(openAiProcessingFunction)
    private localLLMQueue = new LLMRequestProcessingQueue(localLLMProcessingQueue)

    constructor() { }

    enqueue(request: LMMRequestDTO): string {
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
