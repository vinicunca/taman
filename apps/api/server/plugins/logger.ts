import type { HTTPEvent } from 'nitro/h3';
import { consola } from 'consola';
import { definePlugin } from 'nitro';

const startedAt = new WeakMap<HTTPEvent, number>();

function formatTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + ` - ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatLatency(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(1)}µs`;
  }

  if (ms < 10_000) {
    return `${ms.toFixed(3)}ms`;
  }

  return `${(ms / 1000).toFixed(3)}s`;
}

function logStatus(status: number, line: string): void {
  if (status >= 500) {
    consola.error(line);
    return;
  }

  if (status >= 400) {
    consola.warn(line);
    return;
  }

  if (status >= 300) {
    consola.info(line);
    return;
  }

  consola.success(line);
}

export default definePlugin((nitroApp) => {
  if (process.env.CF_DEPLOY_ENV) {
    return;
  }

  nitroApp.hooks.hook('request', (event) => {
    startedAt.set(event, performance.now());
  });

  nitroApp.hooks.hook('response', (res, event) => {
    const start = startedAt.get(event);
    const latencyMs = start === undefined ? 0 : performance.now() - start;

    startedAt.delete(event);

    const { method } = event.req;
    const path = new URL(event.req.url).pathname;
    const status = res.status;
    const line = `[DIRECTOR] ${formatTimestamp(new Date())} | ${status} | `
      + `${formatLatency(latencyMs).padStart(13)} | `
      + `${method.padEnd(7)} "${path}"`;

    logStatus(status, line);
  });
});
