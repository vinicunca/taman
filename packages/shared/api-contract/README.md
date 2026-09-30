# @vinicunca/taman-api-contract

The oRPC contract for the Taman API: zod schemas and procedure signatures,
with no server code. The backend implements it; clients infer every input,
output and error type from it.

Most apps should install [`@vinicunca/request`](../request) alongside it and
create a client from this contract:

```ts
import type { TamanContract } from '@vinicunca/taman-api-contract';
import { createRpcClient, type ContractClient } from '@vinicunca/request/orpc';

export const client = createRpcClient<ContractClient<TamanContract>>({
  url: 'https://api.example.com/api/rpc',
  credentials: 'include',
});
```

Import from here directly to reuse schemas — for example to validate a form
with the exact rule the server enforces:

```ts
import { todoCreateInput } from "@vinicunca/taman-api-contract";

todoCreateInput.shape.title.parse(value);
```

Exports: `contract`, `TamanContract`, `TamanInputs`, `TamanOutputs`,
`TamanClient`, pagination helpers (`paginationInput`, `paginated`,
`toTotalPages`), `ORG_REQUIRED`, and the todo/menu schemas.
