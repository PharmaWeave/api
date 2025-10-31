import { describe, it, expect, vi, beforeEach } from "vitest";
import TemplateService from "@/modules/notification/services/template";
import { TemplateRepositoryMock, mockTemplate } from "@/tests/unit/notification/__mocks__/template.mock";

vi.mock("@/database/data-source", () => import("@/tests/unit/notification/__mocks__/template.mock"));

describe("TemplateService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const getByKeyTestCases = [
        {
            input: "WELCOME",
            expected: mockTemplate,
            shouldPass: true
        },
        {
            input: "NOT_FOUND",
            expected: null,
            shouldPass: true
        },
        {
            input: "ERROR",
            expectedError: "DB error",
            shouldPass: false
        }
    ];

    describe("getByKey()", () => {
        it.each(getByKeyTestCases)("%s", async ({ input, expected, expectedError, shouldPass }) => {
            if (!shouldPass) {
                TemplateRepositoryMock.findOne.mockRejectedValueOnce(new Error(expectedError));
            }

            if (shouldPass) {
                const result = await TemplateService.getByKey(input);
                expect(TemplateRepositoryMock.findOne).toHaveBeenCalledWith({
                    where: { key: input, status: expect.any(String) }
                });
                expect(result).toEqual(expected);
            } else {
                await expect(TemplateService.getByKey(input)).rejects.toThrow(expectedError);
            }
        });
    });

    const formatTestCases = [
        {
            template: "<a>${welcome_link}</a>",
            params: [{ key: "welcome_link", value: "link" }],
            expected: "<a>link</a>",
            shouldPass: true
        },
        {
            template: "Hello ${first} ${last}",
            params: [
                { key: "first", value: "John" },
                { key: "last", value: "Doe" }
            ],
            expected: "Hello John Doe",
            shouldPass: true
        },
        {
            template: "<a></a>",
            params: [],
            expected: "<a></a>",
            shouldPass: true
        },
        {
            template: "<a></a>",
            params: [{ key: "x", value: "y" }],
            expected: "<a></a>",
            shouldPass: true
        },
        {
            template: null as any,
            params: [{ key: "x", value: "y" }],
            expectedError: "Cannot read properties",
            shouldPass: false
        }
    ];

    describe("format()", () => {
        it.each(formatTestCases)("%s", ({ template, params, expected, expectedError, shouldPass }) => {
            if (shouldPass) {
                const result = TemplateService.format(template, params);
                expect(result).toBe(expected);
            } else {
                expect(() => TemplateService.format(template, params)).toThrow(expectedError);
            }
        });
    });
});
