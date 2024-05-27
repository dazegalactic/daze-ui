const esbuild = require('esbuild');
const dotenv = require('dotenv');
dotenv.config();

esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/daze.js',
    platform: 'browser',
    target: ['es6'],
    sourcemap: false,
    minify: true,
    define: {
        'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || ''),
    },
    loader: {
        '.ts': 'ts',
    },
}).catch(() => process.exit(1));
