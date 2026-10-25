import { defineConfig } from 'orval';

declare const process: {
    env: Record<string, string | undefined>;
};

export default defineConfig({
    epochForgotten: {
        input: {
            target: process.env.EPOCH_FORGOTTEN_OPENAPI_PATH ?? '../epoch-forgotten/src/common/api/swagger.json',
        },
        output: {
            target: './src/common/api/.generated/index.ts',
            mode: 'single',
            httpClient: 'axios',
            clean: true,
            urlEncodeParameters: true,
            override: {
                mutator: {
                    path: './src/common/api/mutator.ts',
                    name: 'request',
                },
            },
        },
    },
});
