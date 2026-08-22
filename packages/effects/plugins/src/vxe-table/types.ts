import type { DeepPartial } from '@taman-core/shared/utils';
import type { ClassType } from '@taman/types';
import type { BaseFormComponentType, useVbenForm, VbenFormProps } from '@taman-core/form-ui';
import type { Ref } from 'vue';
import type {
  VxeGridListeners,
  VxeGridPropTypes,
  VxeGridProps as VxeTableGridProps,
  VxeTablePropTypes,
  VxeUIExport,
} from 'vxe-table';

import type { VxeGridApi } from './api';

export interface VxePaginationInfo {
  currentPage: number;
  pageSize: number;
  total: number;
}

interface ToolbarConfigOptions extends VxeGridPropTypes.ToolbarConfig {
  /** Whether to show the toggle search form button */
  search?: boolean;
}

export type VxeTableGridColumns<T = any> = VxeTableGridOptions<T>['columns'];

export interface VxeTableGridOptions<T = any> extends VxeTableGridProps<T> {
  /** Toolbar configuration */
  toolbarConfig?: ToolbarConfigOptions;
}

export interface SeparatorOptions {
  show?: boolean;
  backgroundColor?: string;
}

/**
 * Custom storage adapter interface
 * Users can plug in any backend (API, IndexedDB wrapper, third-party library, etc.)
 */
export interface ViewedRowStorageAdapter {
  /** Read all viewed key values */
  getKeys: () => Promise<Array<number | string>>;

  /** Remove all viewed data */
  removeKeys: () => Promise<void>;

  /** Persist the list of viewed keys */
  setKeys: (keys: Array<number | string>) => Promise<void>;
}

/**
 * Viewed-row persistence — shared base fields
 */
interface ViewedRowPersistBase {
  /** Time-to-live for persisted data (milliseconds) */
  ttl?: number;
  /** Max cache size; evict earliest marked keys (FIFO) when exceeded, default 100 */
  maxSize?: number;
}

/**
 * Viewed-row persistence config (discriminated union by type)
 *
 * - 'memory'          → In-memory only, no persistence
 * - 'localStorage'    → Bulk localStorage storage, key required
 * - 'sessionStorage'  → Bulk sessionStorage storage, key required
 * - 'indexedDB'       → Per-key IndexedDB storage, key required
 * - 'custom'          → User-defined storage adapter, storage required
 */
export type ViewedRowPersistOptions
  = | ({
    /** IndexedDB database name, default 'viewed-table-db' */
    dbName?: string;
    /** IndexedDB database version, default 1 */
    dbVersion?: number;
    /** Storage key / prefix (required) */
    key: string;
    /** IndexedDB object store name, default 'viewed-table-row' */
    storeName?: string;
    type: 'indexedDB';
  } & ViewedRowPersistBase)
  | ({
    /** Storage key (required) */
    key: string;
    type: 'localStorage' | 'sessionStorage';
  } & ViewedRowPersistBase)
  | ({
    /** Custom storage adapter (required) */
    storage: ViewedRowStorageAdapter;
    type: 'custom';
  } & ViewedRowPersistBase)
  | (ViewedRowPersistBase & {
    type: 'memory';
  });

/**
 * Viewed-row options
 */
export interface ViewedRowOptions<T = any> {
  /** Auto-mark row as viewed when a matching CellOperation code is clicked */
  actionCodes?: string | Array<string>;
  /** Row unique id field; defaults to gridOptions.rowConfig.keyField, fallback 'id' */
  keyField?: string;
  /** List of viewed row keys */
  viewedKeys?: Array<number | string> | Ref<Array<number | string>>;
  /**
   * Persistence config
   * - string: built-in localStorage, value is the storage key (backward compatible)
   * - object: advanced config
   * - omitted: no persistence (same as memory)
   */
  persist?: string | ViewedRowPersistOptions;
  rowClassName?: VxeTablePropTypes.RowClassName<T>;
  rowStyle?: VxeTablePropTypes.RowStyle<T>;
}

export interface VxeGridProps<
  T extends Record<string, any> = any,
  D extends BaseFormComponentType = BaseFormComponentType,
  P extends Record<string, any> = Record<never, never>,
> {
  /**
   * Table data
   */
  tableData?: Array<any>;
  /**
   * Title
   */
  tableTitle?: string;
  /**
   * Title help text
   */
  tableTitleHelp?: string;
  /**
   * Component class
   */
  class?: ClassType;
  /**
   * vxe-grid class
   */
  gridClass?: ClassType;
  /**
   * vxe-grid options
   */
  gridOptions?: DeepPartial<VxeTableGridOptions<T>>;
  /**
   * vxe-grid events
   */
  gridEvents?: DeepPartial<VxeGridListeners<T>>;
  /**
   * Form options
   */
  formOptions?: VbenFormProps<D, P>;
  /**
   * Show search form
   */
  showSearchForm?: boolean;
  /**
   * Separator between search form and table body
   */
  separator?: boolean | SeparatorOptions;
  /**
   * Viewed-row feature
   */
  viewedRowOptions?: boolean | ViewedRowOptions<T>;
}

export type ExtendedVxeGridApi<
  D extends Record<string, any> = any,
  F extends BaseFormComponentType = BaseFormComponentType,
  P extends Record<string, any> = Record<never, never>,
> = VxeGridApi<D, F, P> & {
  useStore: <S = NoInfer<VxeGridProps<D, F, P>>>(
    selector?: (state: NoInfer<VxeGridProps<D, F, P>>) => S,
  ) => Readonly<Ref<S>>;
};

export interface SetupVxeTable {
  configVxeTable: (ui: VxeUIExport) => void;
  useVbenForm?: typeof useVbenForm;
}
