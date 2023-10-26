import { ChildProcess, fork } from 'child_process';
import path from 'path';
import { WebSocketServiceType } from 'types/websocket';

// Manager for child processes
export class ProcessManager {
  private processes: Map<string, ChildProcess> = new Map();

  // Start worker process for service/client
  startProcess(serviceId: WebSocketServiceType, clientId: string, worker: string): ChildProcess {
    
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