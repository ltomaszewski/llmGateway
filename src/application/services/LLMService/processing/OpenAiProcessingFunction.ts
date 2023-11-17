import { dotEnv } from "../../../../config/Constants.js";
import { LLMRequestDTO } from "../../../dtos/LLMRequestDTO.js";
import OpenAI from "openai";
import { currentTimestampAndDate } from "../../../helpers/Utils.js";

const openai = new OpenAI({
    apiKey: dotEnv.OPENAI_KEY,
});

export const openAiProcessingFunction = async (request: LLMRequestDTO): Promise<any> => {
    const response = await openai.chat.completions.create({
        model: request.model,
        messages: [
            {
                "role": "system",
                "content": request.system
            },
            {
                "role": "user",
                "content": request.prompt
            }
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    // Custom logic for processing the request
    console.log(currentTimestampAndDate() + ` OpenAi Processed: ${request.id}, prompt: ${request.prompt.slice(0, 80)}` + (request.prompt.length > 80 ? '...' : ''));;
    // Simulate processing with a delay
    return new Promise(resolve => resolve(response));
};