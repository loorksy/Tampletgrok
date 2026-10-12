# API integration example

This package shows how to replace the local demo with your own HTTP API.

The extracted screens do not import this package. They call `getAppAdapters()` inside `@tampletgrok/mock-adapters`. Install your adapters once, at startup:

```ts
import { setAppAdapters } from "@tampletgrok/mock-adapters";
import { createHttpAdapters } from "@tampletgrok/api-integration-example/src/http-adapters";

setAppAdapters(
  createHttpAdapters({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    headers: () => ({ authorization: `Bearer ${token}` }),
  }),
);
```

`setAppAdapters` accepts a partial object. A custom chat adapter can sit next to the demo settings adapter.

See `src/http-adapters.ts` for the routes the example expects. The shapes are the TypeScript interfaces in `@tampletgrok/contracts` (`ChatAdapter`, `AssistantAdapter`, `SettingsAdapter`, `ModelAdapter`, `RoutineAdapter`, `ActivityAdapter`).

Simulated demo replies stay labeled as demo text. Your adapter should return real assistant messages only when a model actually ran.
