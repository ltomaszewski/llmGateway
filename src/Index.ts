// Importing CLIConfiguration class for handling Command Line Interface (CLI) arguments
import 'dotenv/config';
import express from "express";
import { CLIConfiguration } from "./config/CLIConfiguration";
import { LLMRequestRESTService } from "./application/services/REST/LLMRequestRESTService";
import { Env, dotEnv } from "./config/Constants";
import { LLMService } from './application/services/llmService/LLMService';
import { WebSocketServer } from './application/services/WebSocketServer';

// Extracting command line arguments
const args = process.argv;

// Creating CLIConfiguration object from the extracted CLI arguments
export const configuration: CLIConfiguration = CLIConfiguration.fromCommandLineArguments(args);

// Logging the configuration details
console.log("Application started with environment: " + configuration.env);

// Asynchronous function for database operations
(async () => {
    const wss = new WebSocketServer(8080); // Replace with your desired port number
    const llmService = new LLMService(wss)
    await wss.connect();

    // Setup REST Server
    const app = express();
    const PORT = configuration.env == Env.Prod ? 998 : 698
    app.use(express.json());

    // Create REST services
    const baseApi = "/api/v1";
    const llmRequestRESTService = new LLMRequestRESTService(llmService);

    // Install REST services
    llmRequestRESTService.installEndpoints(baseApi, app);

    // Start the server
    app.listen(PORT, () => {
        console.log(`LLM Gatway is running on port ${PORT}`);
    });
})();