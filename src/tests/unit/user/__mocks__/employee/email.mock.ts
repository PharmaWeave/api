import { vi } from "vitest";

export class EmailService {
    send = vi.fn(async () => true);
}

export default EmailService;
