import { QueueService } from "./queue";

export interface EmailJobData {
    to: string;
    subject: string;
    html: string;
}

class EmailService {

    private queue = QueueService.get("emails");

    async send(data: EmailJobData) {
        await this.queue.add("send-email", {
            to: data.to,
            subject: data.subject,
            html: data.html
        });
    }
}

export default EmailService;
