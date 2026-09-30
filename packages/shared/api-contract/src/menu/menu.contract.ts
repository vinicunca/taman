import { oc } from '@orpc/contract';
import { z } from 'zod';

export interface MenuRecord {
  name: string;
  path: string;
  component?: string;
  redirect?: string;
  meta?: Record<string, unknown>;
  children?: Array<MenuRecord>;
}

export const menuRecordSchema: z.ZodType<MenuRecord> = z.lazy(() =>
  z.object({
    name: z.string(),
    path: z.string(),
    component: z.string().optional(),
    redirect: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    children: z.array(menuRecordSchema).optional(),
  }),
);

export const menuContract = {
  all: oc.output(z.array(menuRecordSchema)),
};
