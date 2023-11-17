import { LLMRequestDTO } from "../../../dtos/LLMRequestDTO.js";
import {
    LlamaModel, LlamaJsonSchemaGrammar, LlamaContext, LlamaChatSession
} from "node-llama-cpp";
import path from "path";
import { dotEnv } from "../../../../config/Constants.js";

export const localLLMProcessingQueue = async (request: LLMRequestDTO): Promise<any> => {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('Request timed out'));
        }, 20000);
    });


    const modelPath = path.join(dotEnv.MODELS_PATH, "models", request.model)
    const model = new LlamaModel({
        modelPath: modelPath
    });
    const context = new LlamaContext({ model });
    const session = new LlamaChatSession({ context });

    const prompt = 'System: ' + request.system + '; \n User: ' + request.prompt;
    console.log("Local LLM Input: " + prompt);

    const llmResult = session.prompt(prompt);

    const result: any = await Promise.race([llmResult, timeoutPromise])
        .catch((error) => {
            console.error('Error:', error);
        });

    console.log('Local LLM input: ' + prompt);
    console.log('Local LLM processing result:', result);

    return new Promise(resolve => resolve(result));
};