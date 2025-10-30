// eslint.config.js
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    js.configs.recommended,
    {
        ignores: [
            "build/**",
            "node_modules/**",
            "src/@types/**",
            "src/migrations/**"
        ]
    },
    {
        files: [
            "src/**/*.{ts,tsx,js,jsx}"
        ],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2021,
            sourceType: "module",
            globals: {
                console: "readonly",
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
            }
        },
        plugins: {
            stylistic,
            "@typescript-eslint": ts
        },
        rules: {
            "stylistic/semi": ["error", "always"],
            "stylistic/indent": ["error", 4],
            "stylistic/quotes": [
                "error",
                "double",
                {
                    allowTemplateLiterals: true
                }
            ],

            "no-tabs": "error",
            "stylistic/comma-dangle": ["error", "never"],

            "no-unused-vars": [
                "error",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "caughtErrorsIgnorePattern": "^_"
                }
            ]
        }
    }
];
