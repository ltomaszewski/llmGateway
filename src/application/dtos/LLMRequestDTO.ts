export enum Provider {
    OpenAI = 'openai',
    Local = 'local',
    HuggingFace = 'huggingface'
}

export class LLMRequestDTO {
    readonly id: string | undefined;
    readonly template: string;
    readonly system: string;
    readonly user: string;
    readonly provider: Provider;
    readonly model: string;

    constructor(
        id: string | undefined,
        template: string,
        system: string,
        user: string,
        provider: Provider,
        model: string
    ) {
        this.id = id;
        this.template = template;
        this.system = system;
        this.user = user;
        this.provider = provider;
        this.model = model;
    }

    static createFromObject(obj: any): LLMRequestDTO {
        return new LLMRequestDTO(
            obj.id,
            obj.template,
            obj.system,
            obj.user,
            Provider[obj.provider as keyof typeof Provider], // Converts the string to the corresponding enum value
            obj.model
        );
    }

    createPrompt(values: { [key: string]: string }): string {
        return this.template.replace(/\{(\w+)\}/g, (_, key) => {
            if (key in values) {
                return values[key];
            } else {
                // Throw an error if the key is not found in values
                throw new Error(`Missing value for key: ${key}`);
            }
        });
    }
}