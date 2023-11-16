import { dotEnv } from "../../../../config/Constants";
import { LLMRequestDTO } from "../../../dtos/LLMRequestDTO";
import OpenAI from "openai";

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
    console.log(`Custom OpenAi Processing: ${response}`);
    // Simulate processing with a delay
    return new Promise(resolve => resolve(response));
};