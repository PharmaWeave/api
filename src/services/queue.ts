import { Queue, QueueOptions } from "bullmq";

export class QueueService {

    private static queues: Map<string, Queue> = new Map();

    static get(name: string, options?: QueueOptions): Queue {
        if (!this.queues.has(name)) {
            const queue = new Queue(name, {
                connection: {
                    host: process.env.REDIS_HOST || "localhost",
                    port: Number(process.env.REDIS_PORT) || 6379
                },
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: "exponential",
                        delay: 15 * 60000
                    },
                    removeOnComplete: true,
                    removeOnFail: false
                },
                ...options
            });

            this.queues.set(name, queue);
        }

        return this.queues.get(name)!;
    }
}
