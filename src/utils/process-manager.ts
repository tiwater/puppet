import { ChildProcess, fork } from 'child_process';
import path from 'path';
import { WebSocketServiceType } from 'types/websocket';

// Manager for child processes
export class ProcessManager {
  private processes: Map<string, ChildProcess> = new Map();

  // Start worker process for service/client
  async startProcess(serviceId: WebSocketServiceType, clientId: string, worker: string): Promise<ChildProcess> {
    
    const child = fork(worker, [serviceId.toString(), clientId], {
      // Worker is located in the worker folder
      cwd: path.resolve(__dirname, "worker"),
      // Use the three standard methods and ipc for the communication between the parent and children processes
      stdio: [0, 1, 2, "ipc"],
    });
    this.processes.set(clientId, child);
    return child;
  }

  // Terminate child process for a client
  terminateProcess(clientId: string): void {
    const process = this.processes.get(clientId);

    if (process) {
      process.kill();
      this.processes.delete(clientId);
    }
  }

  // Get a child process for a client
  getProcess(clientId: string): ChildProcess | undefined {
    return this.processes.get(clientId);
  }
}

// Manage puppet processes
export class PuppetProcessManager extends ProcessManager{
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  // Start worker process for service/client
  async startProcess(serviceId: WebSocketServiceType, clientId: string, worker: string): Promise<ChildProcess> {
    const child = await super.startProcess(serviceId, clientId, worker);

    // Terminate the child process in 3 minutes by default
    const timeout = setTimeout(() => {
      this.terminateProcess(clientId);
    }, 3 * 60 * 1000);
    this.timeouts.set(clientId, timeout);
    return child;
  }

  // Terminate the child process
  terminateProcess(clientId: string): void {
    super.terminateProcess(clientId);

    this.disableTimeout(clientId);
  }

  // Disable the timeout for child process
  disableTimeout(clientId: string): void {
    const timeout = this.timeouts.get(clientId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(clientId);
    }
  }
}