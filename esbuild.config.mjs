import dotenv from 'dotenv';
dotenv.config();

import esbuild from 'esbuild';

const isDev = process.env.NODE_ENV === 'development';

/** @type {import('esbuild').BuildOptions} */
const config = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: isDev? 'dist/dev-daze.js' : 'dist/daze.js',
    platform: 'browser',
    target: ['es6'],
    tsconfig: 'tsconfig.json',
    sourcemap: isDev,
    minify: !isDev,
    define: {
        'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || ''),
    },
    loader: {
        '.ts': 'ts',
    },
    logLevel: 'info',  
};

async function start() {
    try {
        const ctx = await esbuild.context(config);
        console.log('Build context created.');

        if (isDev) {
            console.log('Starting development server...');
            const { host, port } = await ctx.serve({
                servedir: 'dist',
                port: 3008,
            });
            console.log(`Development server running at http://${host}:${port}`);
            
            await ctx.watch();
        } else {
            await ctx.rebuild();
            ctx.dispose();
        }
    } catch (error) {
        console.error('Build context creation failed:', error);
        process.exit(1);
    }
}
start();
