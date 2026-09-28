# Cache Module

An asynchronous storage management solution based on the **Strategy Pattern**; it supports multiple storage backends (localStorage, IndexedDB, Memory) and provides a unified API. ## Architecture Design

```shell
┌───────────────────────────────────────────────┐
│             StorageManager                    │
│  ┌─────────────┐  ┌───────────────────────┐   │
│  │ Prefix Isolation │   │   TTL Expiration Mgmt │   │
│  └─────────────┘  └───────────────────────┘   │
├───────────────────────────────────────────────┤
│             IStorageDriver                    │
├──────────┬─────────────────┬──────────────────┤
│  Local   │   IndexedDB     │     Memory       │
│  Storage │   Driver        │     Driver       │
│  Driver  │                 │                  │
└──────────┴─────────────────┴──────────────────┘
```

**Layered Responsibilities:**

| Layer                  | Responsibility                                                        |
| ---------------------- | --------------------------------------------------------------------- |
| `StorageManager`       | Namespace prefix isolation, TTL expiration checks, unified public API |
| `IStorageDriver`       | Pure KV access abstraction interface                                  |
| Driver Implementations | Interface with specific storage engines; unaware of prefixes and TTL  |

---

## Quick Start

### Basic Usage (Default: localStorage)

````typescript
import { StorageManager } from "@vinicunca/taman-core/cache";

const cache = new StorageManager({ prefix: "myapp" });
// Use IndexedDB
//new StorageManager({ driver: new IndexedDBDriver(), prefix: 'app' });

// Use sessionStorage
//new StorageManager({ driver: new LocalStorageDriver({ storageType: 'sessionStorage' }), prefix: 'app' });

// Test environment
//new StorageManager({ driver: new MemoryStorageDriver(), prefix: 'test' });

// Store data
await cache.setItem("user", { name: "Zhang San", age: 28 });

// Read data
const user = await cache.getItem("user");
// => { name: 'Zhang San', age: 28 }

// Read with default value
const settings = await cache.getItem("settings", { theme: "light" });
// Returns { theme: 'light' } if not found

// Delete data
await
``` cache.removeItem("user");

// Clear all data under the current prefix
await cache.clear();
````

### With TTL Expiration

```typescript
const cache = new StorageManager({ prefix: "session" });

// Set to expire after 5 minutes (TTL unit is milliseconds)
await cache.setItem("token", "abc123", 5 * 60 * 1000);

// Can be read normally within 5 minutes
const token = await cache.getItem("token");
// => 'abc123'

// Automatically returns null after 5 minutes (lazy deletion)
const expiredToken = await cache.getItem("token");
// => null

// Manually clean up all expired items
await cache.clearExpiredItems();
```

---

## Storage Drivers

### LocalStorageDriver (Default)

Based on the browser's `localStorage` or `sessionStorage`; provides persistent data storage.

```typescript
import { LocalStorageDriver, StorageManager } from "@vinicunca/taman-core/cache";

// Use localStorage (default)
const cache = new StorageManager({
  driver: new LocalStorageDriver(),
  prefix: "app",
});

// Use sessionStorage
const sessionCache = new StorageManager({
  driver: new LocalStorageDriver({ storageType: "sessionStorage" }),
  prefix: "app",
});
```

**Features:**

- Synchronous APIs wrapped in `async` to maintain a unified interface
- Automatic JSON serialization/deserialization
- Automatically clears data and returns `null` if data corruption occurs
- Storage limit of approximately 5–10MB (depending on the browser)

**Use Cases:** User preferences, small configuration datasets, token storage

---

### IndexedDBDriver

Based on the browser's IndexedDB; supports high-capacity, structured data storage. ```typescript
import {IndexedDBDriver, StorageManager} from '@vinicunca/taman-core/cache';

const cache = new StorageManager({
driver: new IndexedDBDriver({
dbName: 'my-app-db', // Database name; defaults to 'taman-storage'
dbVersion: 1, // Database version; defaults to 1
storeName: 'cache-store', // Object store name; defaults to 'kv-store'
}),
prefix: 'data',
});

// Store large amounts of data
await cache.setItem('table-data', largeDataArray);

// Store binary-friendly structures (natively supported by IndexedDB)
await cache.setItem('config', {
columns: [...],
filters: [...],
pagination: {page: 1, size: 20},
});

````

**Features:**

- Lazy initialization: Automatically opens the database upon the first operation; no need to manually call `init()`
- Large storage capacity (typically ranging from hundreds of MBs to GBs)
- Supports structured cloning (can store complex types like Date, RegExp, Blob, etc.)
- Inherently asynchronous; does not block the main thread

**Use Cases:** Offline data caching, large tabular datasets, file/image caching, complex business data

---

### MemoryStorageDriver

Based on an in-memory Map; data is not persisted and is lost upon page refresh. ```typescript
import { MemoryStorageDriver, StorageManager } from "@vinicunca/taman-core/cache";

const cache = new StorageManager({
driver: new MemoryStorageDriver(),
prefix: "test",
});
````

**Features:**

- Fastest read/write speeds
- No dependency on browser APIs
- Data is destroyed along with the page lifecycle

**Use Cases:** Unit testing, SSR (Server-Side Rendering), temporary runtime caching

---

## API Reference

### StorageManager

#### Constructor

```typescript
new StorageManager(options?: StorageManagerOptions)
```

| Parameter | Type             | Default Value              | Description                        |
| --------- | ---------------- | -------------------------- | ---------------------------------- |
| `driver`  | `IStorageDriver` | `new LocalStorageDriver()` | Storage driver instance            |
| `prefix`  | `string`         | `''`                       | Key prefix for namespace isolation |

#### Methods

| Method       | Signature                                                               | Description                                                    |
| ------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| `getItem`    | `getItem<T>(key: string, defaultValue?: T \| null): Promise<T \| null>` | Retrieves a stored item; returns default if expired or missing |
| `setItem`    | `setItem<T>(key: string, value: T, ttl?: number): Promise<void>`        | Sets a stored item; optional TTL (milliseconds) ​​             |
| `removeItem` | `removeItem(key: string): Promise<void>`                                | Removes a specific stored item                                 |
| `clear`      | `                                                                       |
