import express from "express";
import { LLMRequestDTO } from "../../dtos/LLMRequestDTO.js";
import { LLMService } from "../llmService/LLMService.js";

export class LLMRequestRESTService {
    private llmService: LLMService;

    constructor(llmService: LLMService) {
        this.llmService = llmService; // Initialize processing queue
    }

    installEndpoints(basePath: string, app: express.Application) {
        app.post(basePath + "/request/submit", async (req, res) => {
            try {
                const lmmRequest = LLMRequestDTO.createFromObject(req.body);

                // Validate the request fields
                if (!lmmRequest.system || !lmmRequest.prompt || !lmmRequest.provider || !lmmRequest.model) {
                    throw new Error("All fields are required");
                }

                // Enqueue the request for processing
                const requestId = this.llmService.enqueue(lmmRequest);
                res.status(201).json({ requestId });
            } catch (error: any) {
                res.status(400).json({ error: error.message });
            }
        });

        app.get(basePath + "/request/status/:id", async (req, res) => {
            try {
                const id = req.params.id
                // Implement logic to return the status of the request
                res.status(201).json(this.llmService.getResult(id))
            } catch (error: any) {
                res.status(400).json({ error: error.message });
            }
        });
    }
}