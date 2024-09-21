import type { t } from '../common/mod.ts';
import { HttpUrl } from '../Http/u.Http.Url.ts';

type M = 'GET' | 'PUT' | 'POST' | 'DELETE';
type H = { method: M; handler: Deno.ServeHandler };

/**
 * HTTP test server
 * NOTE:
 *    A basic HTTP testing server is available within @sys/std
 *    ahead of more comprehenvive server tools in @sys/std-s (← "server")
 *    so that HTTP client tools can be end-to-end tested.
 *
 *    Not exposed from the root {exports} of the module.
 *    Example:
 *
 *        import { Testing } from '@sys/std/testing';
 *
 */
export const TestingHttpServer = {
  /**
   * Create and start a new HTTP test server.
   */
  create(defaultHandler?: Deno.ServeHandler): t.TestHttpServer {
    let _disposed = false;

    const server = Deno.serve({ port: 0 }, (req, info) => {
      const list = Array.from(handlers).filter((item) => item.method === req.method);
      if (list.length > 0) return list[0].handler(req, info);
      if (defaultHandler) return defaultHandler?.(req, info);
      return new Response('404 Not Found', { status: 404 });
    });

    const handlers = new Set<H>();
    const addr = server.addr;
    const url = HttpUrl.create(`http://${addr.hostname}:${addr.port}`);

    const api: t.TestHttpServer = {
      addr,
      url,
      get disposed() {
        return _disposed;
      },
      async dispose() {
        _disposed = true;
        await server.shutdown();
      },
    };

    return api;
  },
};
