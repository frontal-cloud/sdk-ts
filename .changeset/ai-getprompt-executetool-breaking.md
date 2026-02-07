---
"@frontal-cloud/ai": major
---

**BREAKING:** `getPrompt` and `executeTool` now return `APIResponse<T>` instead of throwing `FrontalError`. Update callers to check `response.error` instead of using try/catch. `updatePrompt` also returns `APIResponse<Prompt>` and depends on `getPrompt`.
