# API Reference - @frontal-cloud/compute

## `Compute` class
The main entry point for compute operations.

### `run(task: Task): Promise<Result>`
Executes a task on the compute cluster.

### `getStatus(taskId: string): Promise<Status>`
Returns the status of a specific task.
