export class LMMRequestDTO {
    readonly system: string;
    readonly prompt: string;
    readonly provider: string;
    readonly model: string;
    readonly callback: string;

    constructor(
        system: string,
        prompt: string,
        provider: string,
        model: string,
        callback: string,
    ) {
        this.system = system;
        this.prompt = prompt;
        this.provider = provider;
        this.model = model;
        this.callback = callback;
    }

    static createFromObject(obj: any): LMMRequestDTO {
        return new LMMRequestDTO(
            obj.system,
            obj.prompt,
            obj.provider,
            obj.model,
            obj.callback,
        );
    }
}