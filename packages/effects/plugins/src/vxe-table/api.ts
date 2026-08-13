import type { VxeGridInstance } from 'vxe-table';

import type {
  BaseFormComponentType,
  ExtendedFormApi,
} from '@vben-core/form-ui';

import type { VxeGridProps } from './types';
import type { ViewedRowHelper } from './use-viewed-row';

import { toRaw } from 'vue';

import { Store } from '@taman-core/shared/store';
import {
  bindMethods,
  isBoolean,
  isFunction,
  mergeWithArrayOverride,
  StateHandler,
} from '@taman-core/shared/utils';

function getDefaultState(): VxeGridProps {
  return {
    class: '',
    gridClass: '',
    gridOptions: {},
    gridEvents: {},
    formOptions: undefined,
    showSearchForm: true,
  };
}

export class VxeGridApi<
  T extends Record<string, any> = any,
  D extends BaseFormComponentType = BaseFormComponentType,
  P extends Record<string, any> = Record<never, never>,
> {
  public formApi = {} as ExtendedFormApi;

  // private prevState: null | VxeGridProps = null;
  public grid = {} as VxeGridInstance<T>;
  public state: null | VxeGridProps<T, D, P> = null;

  public store: Store<VxeGridProps<T, D, P>>;

  /**
   * Viewed-row helper (initialized in mount; business logic lives in useViewedRow)
   */
  public viewedRowHelper: null | ViewedRowHelper<T> = null;

  private isMounted = false;

  private stateHandler: StateHandler;

  constructor(options: VxeGridProps<T, D, P> = {} as VxeGridProps<T, D, P>) {
    const storeState = { ...options };

    const defaultState = getDefaultState();
    this.store = new Store<VxeGridProps<T, D, P>>(
      mergeWithArrayOverride(storeState, defaultState) as VxeGridProps<T, D, P>,
    );

    this.store.subscribe((state) => {
      // this.prevState = this.state;
      this.state = state;
    });

    this.state = this.store.state;
    this.stateHandler = new StateHandler();
    bindMethods(this);
  }

  /**
   * Clear all viewed-row state
   */
  clearViewedRows() {
    this.viewedRowHelper?.clearViewed();
  }

  /**
   * Get all viewed keys (returns a copy to prevent external mutation)
   */
  getViewedKeys(): Set<number | string> {
    const raw = this.viewedRowHelper?.viewedSet.value;
    return raw ? new Set(raw) : new Set();
  }

  /**
   * Check whether a row is viewed
   */
  isRowViewed(record: T): boolean {
    return this.viewedRowHelper?.isViewed(record) ?? false;
  }

  /**
   * Mark multiple rows as viewed by key
   */
  markKeysAsViewed(keys: Array<number | string>) {
    this.viewedRowHelper?.markKeysAsViewed(keys);
  }

  /**
   * Mark a row as viewed
   */
  markRowAsViewed(record: T) {
    this.viewedRowHelper?.markAsViewed(record);
  }

  mount(instance: null | VxeGridInstance, formApi: ExtendedFormApi) {
    if (!this.isMounted && instance) {
      this.grid = instance;
      this.formApi = formApi;
      this.stateHandler.setConditionTrue();
      this.isMounted = true;
    }
  }

  async query(params: Record<string, any> = {}) {
    try {
      await this.grid.commitProxy('query', toRaw(params));
    } catch (error) {
      console.error('Error occurred while querying:', error);
    }
  }

  async reload(params: Record<string, any> = {}) {
    try {
      await this.grid.commitProxy('reload', toRaw(params));
    } catch (error) {
      console.error('Error occurred while reloading:', error);
    }
  }

  /**
   * Remove viewed state for specific keys
   */
  removeViewedKeys(keys: Array<number | string>) {
    this.viewedRowHelper?.removeKeys(keys);
  }

  setGridOptions(options: Partial<VxeGridProps<T, D, P>['gridOptions']>) {
    this.setState({
      gridOptions: options,
    });
  }

  setLoading(isLoading: boolean) {
    this.setState({
      gridOptions: {
        loading: isLoading,
      },
    });
  }

  setState(
    stateOrFn:
      | ((prev: VxeGridProps<T, D, P>) => Partial<VxeGridProps<T, D, P>>)
      | Partial<VxeGridProps<T, D, P>>,
  ) {
    if (isFunction(stateOrFn)) {
      this.store.setState((prev) => {
        return mergeWithArrayOverride(stateOrFn(prev), prev);
      });
    } else {
      this.store.setState((prev) => mergeWithArrayOverride(stateOrFn, prev));
    }
  }

  toggleSearchForm(show?: boolean) {
    this.setState({
      showSearchForm: isBoolean(show) ? show : !this.state?.showSearchForm,
    });
    // nextTick(() => {
    //   this.grid.recalculate();
    // });
    return this.state?.showSearchForm;
  }

  unmount() {
    this.isMounted = false;
    this.stateHandler.reset();
    this.viewedRowHelper = null;
  }
}
