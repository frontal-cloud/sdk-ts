# API Reference - @frontal-cloud/functions

## `Functions` class
The main entry point for function orchestration.

### `deploy(name: string, code: string): Promise<void>`
Deploys a new function.

### `invoke(name: string, data: any): Promise<any>`
Invokes a deployed function.
