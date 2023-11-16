export enum Provider {
    OpenAI = 'openai',
    Local = 'local',
    HuggingFace = 'huggingface'
}

export class LMMRequestDTO {
    readonly system: string;
    readonly prompt: string;
    readonly provider: Provider;
    readonly model: string;
    readonly callback: string;

    constructor(
        system: string,
        prompt: string,
        provider: Provider,
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
            Provider[obj.provider as keyof typeof Provider], // Converts the string to the corresponding enum value
            obj.model,
            obj.callback,
        );
    }
}