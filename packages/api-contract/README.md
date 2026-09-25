# @vinicunca/taman-api-contract

The oRPC contract for the Taman API: zod schemas and procedure signatures,
with no server code. The backend implements it; clients infer every input,
output and error type from it.

Most apps should install [`@vinicunca/taman-request`](../effects/request),
which depends on this package. Import from here directly to reuse schemas —
for example to validate a form with the exact rule the server enforces:

```ts
import { todoCreateInput } from '@vinicunca/taman-api-contract';

todoCreateInput.shape.title.parse(value);
```

Exports: `contract`, `TamanContract`, `TamanInputs`, `TamanOutputs`,
`TamanClient`, pagination helpers (`paginationInput`, `paginated`,
`toTotalPages`), `ORG_REQUIRED`, and the todo/menu schemas.
