import { LMMRequestDTO } from "../dtos/LMMRequestDTO";

export class LLMResult {
    readonly requestId: string;
    readonly request: LMMRequestDTO;
    readonly result: any | undefined;
    readonly error: any | undefined;

    constructor(
        requestId: string,
        request: LMMRequestDTO,
        result: any | undefined,
        error: any | undefined
    ) {
        this.requestId = requestId;
        this.request = request;
        this.result = result;
        this.error = error;
    }
}