import { vi } from "vitest";

export const mockTemplate = {
    key: "WELCOME",
    template: "<a>${welcome_link}</a>",
    status: "A"
};

export const TemplateRepositoryMock = {
    findOne: vi.fn(async (query) => {
        if (query.where.key === "WELCOME") return mockTemplate;
        return null;
    })
};

export const AppDataSource = {
    getRepository: vi.fn(() => TemplateRepositoryMock)
};

export default { AppDataSource };
