namespace NodeJS {
    interface ProcessEnv {
        JWT_SECRET: string;
        JWT_REFRESH_SECRET: string;

        POSTGRES_USER: string;
        POSTGRES_PASSWORD: string;
        POSTGRES_DB: string;

        DATABASE_PORT: string;
        DATABASE_HOSTNAME: string;
    }
}
