import { LLMRequestDTO } from "../../../dtos/LLMRequestDTO.js";
import { LlamaModel, LlamaContext, LlamaChatSession } from "node-llama-cpp";
import path from "path";
import { dotEnv } from "../../../../config/Constants.js";
import { LlamaCppEmbeddings } from "langchain/embeddings/llama_cpp";

export const LocalLLMEmbeddingFunction = async (request: LLMRequestDTO): Promise<any> => {
    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                return new Promise(reject => reject('Time out'));
            }, 20000);
        });

        const modelPath = path.join(dotEnv.MODELS_PATH, "models", request.model)

        const embeddings = new LlamaCppEmbeddings({
            modelPath: modelPath,
        });

        console.log("Embed LocalLLM Input: " + request.user);

        const llmResult = embeddings.embedQuery(request.user);

        const result: any = await Promise.race([llmResult, timeoutPromise])
            .catch((error) => {
                console.error('Error:', error);
            });

        console.log('Embed LocalLLM result:', result);
        return new Promise(resolve => resolve(result));
    } catch (error: any) {
        return new Promise(reject => reject('Internal Error ' + error.message));
    }
};