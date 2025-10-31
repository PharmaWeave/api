import { vi } from "vitest";

export const bcryptjs = {
    hash: vi.fn((_v) => true)
};

export default bcryptjs;
