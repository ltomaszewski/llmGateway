
// Enumeration representing different environment modes: Development and Production
export enum Env {
    Dev, // Development environment
    Prod // Production environment
}

// Maximum number of retries for API requests
export const MAX_RETRIES: number = 3;
// DatabaseHost - the hostname of the RethinkDB server
export const DatabaseHost = '192.168.50.101';
// DatabasePort - the port number of the RethinkDB server
export const DatabasePort = 28015;
// DatabaseForceDrop - indicates whether the database should be forcefully dropped (true/false)
export const DatabaseForceDrop = false;

export const baseDatabaseName = "LLM_GATEWAY";

function getEnvVar(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

export interface ProcessEnv {
    OPENAI_KEY: string;
    WSS_AUTH_TOKEN: string;
}

export const dotEnv: ProcessEnv = {
    OPENAI_KEY: getEnvVar('OPENAI_KEY'),
    WSS_AUTH_TOKEN: getEnvVar('WSS_AUTH_TOKEN')
};