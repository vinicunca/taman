import type { RemoveIndexSignature } from '@taman-core/typings';
import type { ContextMenuItem } from 'pohon-ui';

type StrictContextMenuItemBase = RemoveIndexSignature<ContextMenuItem>;

/**
 * pohon-ui `ContextMenuItem` without `[key: string]: any`.
 * Use this when authoring menus so typos and unknown fields are caught.
 */
export type StrictContextMenuItem = Omit<
  StrictContextMenuItemBase,
  'children'
> & {
  children?: Array<StrictContextMenuItem> | Array<Array<StrictContextMenuItem>>;
  key: string;
};
