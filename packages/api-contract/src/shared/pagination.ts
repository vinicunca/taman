import { z } from 'zod';

export const PAGE_SIZE_MAX = 100;
export const DEFAULT_PAGE_SIZE = 20;

/** Offset pagination input shared by every paginated procedure. */
export const paginationInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(PAGE_SIZE_MAX).default(DEFAULT_PAGE_SIZE),
});

export type PaginationInput = z.infer<typeof paginationInput>;

/** Wraps an item schema in the shared page envelope. */
export function paginated<TItem extends z.ZodType>(item: TItem) {
  return z.object({
    items: z.array(item),
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  });
}

export function toOffset({ page, pageSize }: PaginationInput): number {
  return (page - 1) * pageSize;
}

export function toTotalPages(total: number, pageSize: number): number {
  return total === 0 ? 0 : Math.ceil(total / pageSize);
}
