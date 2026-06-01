interface TreeConfigOptions {
  // The name of the child property, default is 'children'
  childProps: string;
}

/**
 * Traverse the tree structure and return the values of all nodes.
 * @param tree The tree structure array.
 * @param getValue The function to get the value of the node.
 * @param options The optional property name of the child node array.
 * @returns The array of values of all nodes.
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
 * Map the tree structure according to the given condition
 * @param tree The root node array of the tree structure to be filtered.
 * @param mapper The condition for mapping each node.
 * @param options The optional property name of the child node array.
 */
function mapTree<T, V extends Record<string, any>>(
  tree: Array<T>,
  mapper: (node: T) => V,
  options?: TreeConfigOptions,
): Array<V> {
  const { childProps } = options || {
    childProps: 'children',
  };
  return tree.map((node) => {
    const mapperNode: Record<string, any> = mapper(node);
    if (mapperNode[childProps]) {
      mapperNode[childProps] = mapTree(mapperNode[childProps], mapper, options);
    }
    return mapperNode as V;
  });
}

/**
 * Filter the nodes of the given tree structure according to the given condition, and return the array of all matching nodes in the original order.
 * @param tree The root node array of the tree structure to be filtered.
 * @param filter The condition for filtering each node.
 * @param options The optional property name of the child node array.
 * @returns The array of all matching nodes in the original order.
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
 * Recursively sort the tree structure data
 * @param treeData - The tree structure data array
 * @param sortFunction - Sort function, used to define the sorting rules
 * @param options - Configuration options, including the name of the child node array
 * @returns The sorted tree structure data
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

export {
  filterTree,
  mapTree,
  sortTree,
  traverseTreeValues,
};
