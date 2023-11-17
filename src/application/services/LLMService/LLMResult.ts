import { LLMRequestDTO } from "../../dtos/LLMRequestDTO.js";

export class LLMResult {
    readonly requestId: string;
    readonly request: LLMRequestDTO;
    readonly result: any | undefined;
    readonly error: any | undefined;

    constructor(
        requestId: string,
        request: LLMRequestDTO,
        result: any | undefined,
        error: any | undefined
    ) {
        this.requestId = requestId;
        this.request = request;
        this.result = result;
        this.error = error;
    }
}