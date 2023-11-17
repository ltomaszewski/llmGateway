export enum Provider {
    OpenAI = 'openai',
    Local = 'local',
    HuggingFace = 'huggingface'
}

export class LLMRequestDTO {
    readonly id: string | undefined;
    readonly system: string;
    readonly prompt: string;
    readonly provider: Provider;
    readonly model: string;

    constructor(
        id: string | undefined,
        system: string,
        prompt: string,
        provider: Provider,
        model: string
    ) {
        this.id = id;
        this.system = system;
        this.prompt = prompt;
        this.provider = provider;
        this.model = model;
    }

    static createFromObject(obj: any): LLMRequestDTO {
        return new LLMRequestDTO(
            obj.id,
            obj.system,
            obj.prompt,
            Provider[obj.provider as keyof typeof Provider], // Converts the string to the corresponding enum value
            obj.model
        );
    }
}