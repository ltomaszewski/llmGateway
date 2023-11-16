// Importing the Env enum from the Constants module
import { Env } from "./Constants";

// Class representing CLI configuration
export class CLIConfiguration {
    readonly env: Env; // Environment mode (Development or Production)

    // Private constructor to create an instance of CLIConfiguration
    private constructor(env: Env) {
        this.env = env;
    }

    // Static method to create CLIConfiguration instance from command line arguments
    static fromCommandLineArguments(argv: string[]): CLIConfiguration {
        // Checking if production mode flag is present in command line arguments
        const producationMode = argv.find(arg => arg.includes('--runmode=producation'));
        const env = producationMode !== undefined ? Env.Prod : Env.Dev;

        return new CLIConfiguration(env);
    }
}