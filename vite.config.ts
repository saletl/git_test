import { defineConfig, loadEnv, type Connect, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

type DevApiModule = typeof import('./server/devApi');

/**
 * Serves /api/* on your own computer so the grown-up email form can be tried without deploying.
 * The server code is loaded through Vite (not bundled into this config file).
 */
function localApi(mode: string): Plugin {
  const env = () => ({ ...loadEnv(mode, process.cwd(), ''), ...process.env });
  const mount = (middlewares: Connect.Server, loader: () => ViteDevServer, root: string) => {
    middlewares.use((req, res, next) => {
      if (!req.url?.startsWith('/api/')) return next();
      loader()
        .ssrLoadModule('/server/devApi.ts')
        .then((mod) => (mod as DevApiModule).devApiMiddleware(env(), root)(req, res, next))
        .catch(next);
    });
  };
  return {
    name: 'curious-creature-clinic-local-api',
    configureServer(server) {
      mount(server.middlewares, () => server, server.config.root);
    },
    async configurePreviewServer(server) {
      const { createServer } = await import('vite');
      const loader = await createServer({
        configFile: false,
        root: server.config.root,
        logLevel: 'silent',
        appType: 'custom',
        server: { middlewareMode: true, hmr: false, ws: false },
      });
      mount(server.middlewares, () => loader, server.config.root);
      server.httpServer?.on('close', () => void loader.close());
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(mode)],
  optimizeDeps: { include: ['pdf-lib'] },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
  },
}));
