namespace NodeJS {
    interface ProcessEnv {
        JWT_SECRET: string;
        JWT_REFRESH_SECRET: string;

        JWT_PASSWORD_SECRET: string;

        POSTGRES_USER: string;
        POSTGRES_PASSWORD: string;
        POSTGRES_DB: string;

        DATABASE_PORT: string;
        DATABASE_HOSTNAME: string;

        REDIS_HOST: string;
        REDIS_PORT: string;

        AWS_REGION: string;
        AWS_ACCESS_KEY_ID: string;
        AWS_SECRET_ACCESS_KEY: string;

        WEB_URL: string;

        NODE_ENV: string;
    }
}
