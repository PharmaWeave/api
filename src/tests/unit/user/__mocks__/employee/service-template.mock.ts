import { vi } from "vitest";

export default {
    getByKey: vi.fn(async () => ({
        subject: "Welcome",
        template: "<a>{welcome_link}</a>"
    })),
    format: vi.fn((template, values) =>
        template.replace("{welcome_link}", values[0].value)
    )
};
