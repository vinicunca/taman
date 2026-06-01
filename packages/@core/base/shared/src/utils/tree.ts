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

export {
  traverseTreeValues,
};
