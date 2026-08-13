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
function traverseTreeValues<T, V>(
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
 * @param tree Root node array to filter
 * @param filter Predicate used to match each node
 * @param options Optional property name used for child arrays
 * @returns Array of matching nodes
 */
function filterTree<T extends Record<string, any>>(
  tree: Array<T>,
  filter: (node: T) => boolean,
  options?: TreeConfigOptions,
): Array<T> {
  const { childProps } = options || {
    childProps: 'children',
  };

  const _filterTree = (nodes: Array<T>): Array<T> => {
    return nodes.filter((node: Record<string, any>) => {
      if (filter(node as T)) {
        if (node[childProps]) {
          node[childProps] = _filterTree(node[childProps]);
        }
        return true;
      }
      return false;
    });
  };

  return _filterTree(tree);
}

/**
 * Recursively map nodes in a tree structure.
 * @param tree Root node array to map
 * @param mapper Function used to map each node
 * @param options Optional property name used for child arrays
 */
function mapTree<T, V extends Record<string, any>>(
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
 * Recursively sort tree data.
 * @param treeData Tree data array
 * @param sortFunction Sort comparator
 * @param options Options including the child property name
 * @returns Sorted tree data
 */
function sortTree<T extends Record<string, any>>(
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

export { filterTree, mapTree, sortTree, traverseTreeValues };
