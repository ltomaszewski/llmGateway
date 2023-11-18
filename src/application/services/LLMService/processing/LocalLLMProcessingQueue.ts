import { LLMRequestDTO } from "../../../dtos/LLMRequestDTO.js";
import { LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp";
import path from "path";
import { dotEnv } from "../../../../config/Constants.js";

export const localLLMProcessingQueue = async (request: LLMRequestDTO): Promise<any> => {
    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                return new Promise(reject => reject('Time out'));
            }, 20000);
        });

        const modelPath = path.join(dotEnv.MODELS_PATH, "models", request.model)
        const model = new LlamaModel({
            modelPath: modelPath
        });
        const contextSize = 8196
        const context = new LlamaContext({ model: model, contextSize: contextSize });
        const session = new LlamaChatSession({ context });

        const prompt = request.createPrompt({ system: request.system, user: request.user });
        console.log("Local LLM Input: " + prompt);

        const llmResult = session.prompt(prompt);

        const result: any = await Promise.race([llmResult, timeoutPromise])
            .catch((error) => {
                console.error('Error:', error);
            });

        console.log('Local LLM input: ' + prompt);
        console.log('Local LLM processing result:', result);
        return new Promise(resolve => resolve(result));
    } catch (error: any) {
        return new Promise(reject => reject('Internal Error ' + error.message));
    }
};