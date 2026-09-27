# @vinicunca/tsconfig

Shared TypeScript presets. Applications own their include/exclude paths, output
directories, and application-specific global declarations.

| Preset | Use for |
| --- | --- |
| `base.json` | Shared strictness options; choose module settings in the consumer or another preset. |
| `node.json` | Native Node module semantics (`NodeNext` for module and resolution). |
| `node-bundler.json` | Node tooling processed by a bundler or compatible loader; allows extensionless relative imports. |
| `web.json` | Vue/Vite browser code with Vite client types. |
| `library.json` | Bundler-based library builds with DOM types and declaration output enabled. |

```json
{
  "extends": "@vinicunca/tsconfig/node-bundler.json",
  "include": ["src", "vite.config.ts"]
}
```

Install TypeScript in the consumer. Node presets also require `@types/node`;
the web preset requires Vite and Vue. Only the currently installed workspace
TypeScript version has been verified; broader version compatibility is not
yet established.

## Choosing a Node preset

Use `node-bundler.json` when Vite, tsdown, or a compatible loader resolves your
source imports. Use `node.json` when checking against native Node's ESM/CJS
rules. For ESM compiled to JavaScript, use imports such as `./helper.js` in
TypeScript source; TypeScript resolves these to the matching source file.
Set `type: module` in the consumer's package.json when targeting ESM.

These presets inherit `noEmit: true`; choosing NodeNext does not itself build
JavaScript or rewrite extensionless imports. Override emit/output settings in
the project's build configuration when needed. Select a target/lib matching
your supported Node versions; the shared default is ESNext.

For published libraries, also verify declarations with a NodeNext consumer.
Bundling JavaScript alone does not make separately emitted declarations
compatible with native Node resolution.

## Migration

`node.json` previously used bundler resolution. Existing consumers should
extend `node-bundler.json` to retain that behavior. Adopt `node.json` separately
when ready to validate native Node module semantics.

`web-app.json` has been removed. Extend `web.json` and explicitly include
application globals in the consumer, for example:

```json
{
  "extends": "@vinicunca/tsconfig/web.json",
  "compilerOptions": {
    "types": ["vite/client", "@taman/types/global"]
  },
  "include": ["src"]
}
```

The types array replaces the inherited list. Taman globals are optional
consumer configuration, not a dependency of this package.
