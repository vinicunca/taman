interface TreeConfigOptions {
  // Child property name; defaults to 'children'
  childProps: string;
}

/**
 * Traverse a tree and collect the specified value from every node.
 * @param tree Tree array
 * @param getValue Function that extracts the value from a node
 * @param options Optional property name used for child arrays
 * @returns Array of collected values
 */
export function traverseTreeValues<T, V>(
  tree: Array<T>,
  getValue: (node: T) => V,
  options?: TreeConfigOptions,
): Array<V> {
  const result: Array<V> = [];
  const { childProps } = options || {
    childProps: 'children',
  };

  const dfs = (treeNode: T) => {
    const value = getValue(treeNode);
    result.push(value);
    const children = (treeNode as Record<string, any>)?.[childProps];
    if (!children) {
      return;
    }
    if (children.length > 0) {
      for (const child of children) {
        dfs(child);
      }
    }
  };

  for (const treeNode of tree) {
    dfs(treeNode);
  }
  return result.filter(Boolean);
}

/**
 * Filter nodes in a tree by condition and return all matching nodes in original order.
 *
 * This function is a pure function: it does not write the filtered results back to the tree (source data is not modified).
 * Otherwise, when filtering the same tree with different conditions again (e.g., after switching user roles and regenerating routes),
 * the previously filtered child nodes will be permanently lost.
 *
 * @param tree Root node array to filter
 * @param filter Predicate used to match each node
 * @param options Optional property name used for child arrays
 * @returns Array of matching nodes
 */
export function filterTree<T extends Record<string, any>>(
  tree: Array<T>,
  filter: (node: T) => boolean,
  options?: TreeConfigOptions,
): Array<T> {
  const { childProps } = options || {
    childProps: 'children',
  };

  const _filterTree = (nodes: Array<T>): Array<T> => {
    const result: Array<T> = [];

    for (const node of nodes) {
      if (!filter(node)) {
        continue;
      }

      const children = (node as Record<string, any>)[childProps];

      if (!children) {
        result.push(node);
        continue;
      }

      const filteredChildren = _filterTree(children);

      // When the child node sequence is exactly the same before and after filtering, the branch node must be the original object,
      // otherwise the caller caching the route/menu node will consider the content to have changed.
      const childrenUnchanged
        = filteredChildren.length === children.length
          && filteredChildren.every((child, index) => child === children[index]);

      result.push(
        childrenUnchanged ? node : { ...node, [childProps]: filteredChildren },
      );
    }

    return result;
  };

  return _filterTree(tree);
}

/**
 * Re-map the given tree structure by condition
 * @param tree Root node array to filter
 * @param mapper Predicate used to map each node
 * @param options Optional property name used for child arrays
 */
export function mapTree<T, V extends Record<string, any>>(
  tree: Array<T>,
  mapper: (node: T, parent: null | V) => V,
  options?: TreeConfigOptions,
  parent: null | V = null,
): Array<V> {
  const { childProps } = options || {
    childProps: 'children',
  };
  return tree.map((node) => {
    const mapperNode: Record<string, any> = mapper(node, parent as null | V);
    if (mapperNode[childProps]) {
      mapperNode[childProps] = mapTree(
        mapperNode[childProps],
        mapper,
        options,
        mapperNode as V,
      );
    }
    return mapperNode as V;
  });
}

/**
 * Recursively sort the tree structure data
 * @param treeData Tree structure data array
 * @param sortFunction Sort function used to define sorting rules
 * @param options Optional property name used for child arrays
 * @returns Sorted tree structure data
 */
export function sortTree<T extends Record<string, any>>(
  treeData: Array<T>,
  sortFunction: (a: T, b: T) => number,
  options?: TreeConfigOptions,
): Array<T> {
  const { childProps } = options || {
    childProps: 'children',
  };

  return treeData.toSorted(sortFunction).map((item) => {
    const children = item[childProps];
    if (children && Array.isArray(children) && children.length > 0) {
      return {
        ...item,
        [childProps]: sortTree(children, sortFunction, options),
      };
    }
    return item;
  });
}
