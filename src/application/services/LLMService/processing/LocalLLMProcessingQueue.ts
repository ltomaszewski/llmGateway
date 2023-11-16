import { LMMRequestDTO } from "../../../dtos/LMMRequestDTO";
import fetch from 'node-fetch';

const apiUrl = 'http://localhost:11434/api/generate';


export const localLLMProcessingQueue = async (request: LMMRequestDTO): Promise<any> => {
    const requestData = {
        model: request.model,
        prompt: 'System: ' + request.system + '; User Prompt: ' + request.prompt,
        stream: false,
        raw: true,
        context: []
    };

    const fetchPromise = fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('Request timed out'));
        }, 3000);
    });

    const result: any = await Promise.race([fetchPromise, timeoutPromise])
        .catch((error) => {
            console.error('Error:', error);
        });

    const resultJson = await result.json();

    console.log('Local LLM input: ' + requestData.prompt);
    console.log('Local LLM processing result:', resultJson);

    return new Promise(resolve => resolve(resultJson));
};