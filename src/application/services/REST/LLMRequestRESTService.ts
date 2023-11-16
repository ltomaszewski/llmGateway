import express from "express";
import { LMMRequestDTO } from "../../dtos/LMMRequestDTO";
import { LLMRequestProcessingQueue } from "../LLMService/LLMRequestProcessingQueue";

export class LLMRequestRESTService {
    private processingQueue: LLMRequestProcessingQueue;

    constructor(processingQueue: LLMRequestProcessingQueue) {
        this.processingQueue = processingQueue; // Initialize processing queue
    }

    installEndpoints(basePath: string, app: express.Application) {
        app.post(basePath + "/request/submit", async (req, res) => {
            try {
                const lmmRequest = LMMRequestDTO.createFromObject(req.body);

                // Validate the request fields
                if (!lmmRequest.system || !lmmRequest.prompt || !lmmRequest.provider || !lmmRequest.model || !lmmRequest.callback) {
                    throw new Error("All fields are required");
                }

                // Enqueue the request for processing
                const requestId = this.processingQueue.enqueue(lmmRequest);
                res.status(201).json({ requestId });
            } catch (error: any) {
                res.status(400).json({ error: error.message });
            }
        });

        app.get(basePath + "/request/status/:id", async (req, res) => {
            const id = req.params.id
            // Implement logic to return the status of the request
            res.status(201).json(this.processingQueue.getResult(id))
        });
    }
}