import { dotEnv } from "../../../../config/Constants.js";
import { LLMRequestDTO } from "../../../dtos/LLMRequestDTO.js";
import OpenAI from "openai";
import { currentTimestampAndDate } from "../../../helpers/Utils.js";

const openai = new OpenAI({
    apiKey: dotEnv.OPENAI_KEY,
});

export const OpenAiEmbeddingFunction = async (request: LLMRequestDTO): Promise<any> => {
    const response = await openai.embeddings.create({
        input: request.user,
        model: request.model
    })

    // Custom logic for processing the request
    console.log(currentTimestampAndDate() + ` OpenAi Embedding processed: ${request.id}, prompt: ${request.user.slice(0, 80)}` + (request.user.length > 80 ? '...' : ''));;
    // Simulate processing with a delay
    return new Promise(resolve => resolve(response));
};