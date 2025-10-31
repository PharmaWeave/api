import { Worker } from "bullmq";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface EmailJobData {
    to: string;
    subject: string;
    html: string;
}

const ses = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const worker = new Worker<EmailJobData>(
    "emails",
    async (job) => {
        console.log(`Enviando email para ${job.data.to}`);

        const command = new SendEmailCommand({
            Source: "contact@mateusvrs.dev",
            Destination: {
                ToAddresses: [job.data.to],
            },
            Message: {
                Subject: { Data: job.data.subject },
                Body: {
                    Html: { Data: job.data.html },
                },
            },
        });

        await ses.send(command);

        console.log(`Email enviado com sucesso: ${job.id}`);
    },
    {
        connection: {
            host: "localhost",
            port: Number(process.env.REDIS_PORT) || 6379,
        },
        concurrency: 1,
        limiter: {
            max: 1,
            duration: 1500
        }
    }
);

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} falhou: ${err.message}`);
});

worker.on("completed", (job) => {
    console.log(`Job ${job.id} concluído`);
});
