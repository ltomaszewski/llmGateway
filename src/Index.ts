// Importing CLIConfiguration class for handling Command Line Interface (CLI) arguments
import 'dotenv/config';
// import express from "express";
// import { LLMRequestRESTService } from "./application/services/REST/LLMRequestRESTService";
// import { Env, dotEnv } from "./config/Constants";
// import { LLMService } from './application/services/llmService/LLMService';
// import { WebSocketServer } from './application/services/WebSocketServer';
// import { currentTimestampAndDate } from './application/helpers/Utils';

import {
    LlamaModel, LlamaJsonSchemaGrammar, LlamaContext, LlamaChatSession
} from "node-llama-cpp";
import path from "path";

import { CLIConfiguration } from './config/CLIConfiguration.js';
import { Env, dotEnv } from './config/Constants.js';
import { EasyWebSocketServer } from './application/services/EasyWebSocketServer.js';
import { LLMService } from './application/services/llmServicev2/LLMService.js';

// // Extracting command line arguments
const args = process.argv;

// // Creating CLIConfiguration object from the extracted CLI arguments
export const configuration: CLIConfiguration = CLIConfiguration.fromCommandLineArguments(args);

// // Logging the configuration details
// console.log(currentTimestampAndDate() + " Application started with environment: " + configuration.env);

// Asynchronous function for database operations
(async () => {
    const PORT = configuration.env == Env.Prod ? 998 : 698
    const WSS_PORT = configuration.env == Env.Prod ? 1998 : 1698

    const wss = new EasyWebSocketServer(WSS_PORT); // Replace with your desired port number
    const llmService = new LLMService(wss);
    await wss.connect();

    // Setup REST Server
    // const app = express();
    // app.use(express.json());

    // Create REST services
    // const baseApi = "/api/v1";
    // const llmRequestRESTService = new LLMRequestRESTService(llmService);

    // Install REST services
    // llmRequestRESTService.installEndpoints(baseApi, app);

    // Start the server
    // app.listen(PORT, () => {
    //     console.log(`LLM Gatway is running on port ${PORT}`);
    // });

})();