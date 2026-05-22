import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

export default defineConfig({
  plugins: [
    localDoctorShareApi(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: '医前记',
        short_name: '医前记',
        description: '诊前信息整理与沟通辅助系统',
        theme_color: '#006485',
        background_color: '#f6fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: '64x64', type: 'image/svg+xml' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        maximumFileSizeToCacheInBytes: 3145728,
        // 通义千问 API 走在线，不做 SW 缓存（避免鉴权/CORS 问题）
        navigateFallbackDenylist: [/^\/api\//, /dashscope\.aliyuncs\.com/],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});

function localDoctorShareApi(): Plugin {
  return {
    name: 'local-doctor-share-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/share-summary')) {
          next();
          return;
        }

        try {
          const url = new URL(req.url, 'http://localhost');
          const parts = url.pathname.split('/').filter(Boolean);
          if (parts[0] !== 'api' || parts[1] !== 'share-summary' || parts.length > 3) {
            next();
            return;
          }

          const token = parts[2];
          const event = {
            httpMethod: req.method || 'GET',
            headers: normalizeHeaders(req.headers),
            body: await readRequestBody(req),
            queryStringParameters: {
              ...Object.fromEntries(url.searchParams),
              ...(token ? { token } : {}),
            },
          };
          const mod = token
            ? await import('./netlify/functions/get-share-summary.mjs')
            : await import('./netlify/functions/share-summary.mjs');
          sendFunctionResponse(res, await mod.handler(event));
        } catch (error) {
          server.config.logger.error(error instanceof Error ? error.message : String(error));
          sendFunctionResponse(res, {
            statusCode: 500,
            headers: { 'content-type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ error: 'Local share API failed' }),
          });
        }
      });
    },
  };
}

function normalizeHeaders(headers: IncomingMessage['headers']): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers)
      .filter((entry): entry is [string, string | string[]] => typeof entry[1] !== 'undefined')
      .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]),
  );
}

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendFunctionResponse(
  res: ServerResponse,
  response: { statusCode?: number; headers?: Record<string, string>; body?: string },
) {
  res.statusCode = response.statusCode || 200;
  Object.entries(response.headers || {}).forEach(([key, value]) => res.setHeader(key, value));
  res.end(response.body || '');
}
