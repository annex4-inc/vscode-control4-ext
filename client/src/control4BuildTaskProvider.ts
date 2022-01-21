
import * as vscode from 'vscode';
import { Builder, BuildVersion } from './control4/builder';

interface Control4BuildTaskDefinition extends vscode.TaskDefinition {
  version: BuildVersion;
  encryption: boolean;
  template: boolean;
}

export class Control4BuildTaskProvider implements vscode.TaskProvider {
  static BuildType = 'control4';
  private tasks: vscode.Task[] | undefined;

  // We use a CustomExecution task when state needs to be shared accross runs of the task or when 
  // the task requires use of some VS Code API to run.
  // If you don't need to share state between runs and if you don't need to execute VS Code API in your task, 
  // then a simple ShellExecution or ProcessExecution should be enough.
  // Since our build has this shared state, the CustomExecution is used below.
  private sharedState: string | undefined;

  constructor(private workspaceRoot: string) { }

  public async provideTasks(): Promise<vscode.Task[]> {
    return this.getTasks();
  }

  public resolveTask(_task: vscode.Task): vscode.Task | undefined {
    const definition: Control4BuildTaskDefinition = <any>_task.definition;
    return this.getTask(definition.version, definition.encryption, definition.template, definition);
  }

  private getTasks(): vscode.Task[] {
    if (this.tasks !== undefined) {
      return this.tasks;
    }

    const versions: BuildVersion[] = [BuildVersion.Debug, BuildVersion.Release];

    this.tasks = [];

    versions.forEach(version => {
      //@ts-ignore
      this.tasks!.push(this.getTask(version));
    });

    return this.tasks;
  }

  private getTask(version: BuildVersion, encryption: boolean, template: boolean, definition?: Control4BuildTaskDefinition): vscode.Task {
    if (definition === undefined) {
      definition = {
        type: Control4BuildTaskProvider.BuildType,
        version,
        encryption,
        template
      };
    }
    return new vscode.Task(definition, vscode.TaskScope.Workspace, `Package Driver - ${version}`,
      Control4BuildTaskProvider.BuildType, new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
        return new CustomBuildTaskTerminal(this.workspaceRoot, version, encryption, template, () => this.sharedState, (state: string) => this.sharedState = state);
      }));
  }
}

class CustomBuildTaskTerminal implements vscode.Pseudoterminal {
  private writeEmitter = new vscode.EventEmitter<string>();
  private closeEmitter = new vscode.EventEmitter<void>();

  onDidWrite: vscode.Event<string> = this.writeEmitter.event;
  onDidClose?: vscode.Event<void> = this.closeEmitter.event;

  private fileWatcher: vscode.FileSystemWatcher | undefined;

  constructor(private workspaceRoot: string, private version: BuildVersion, private encryption: boolean, private template: boolean, private getSharedState: () => string | undefined, private setSharedState: (state: string) => void) {
  }

  open(initialDimensions: vscode.TerminalDimensions | undefined): void {
    this.doBuild();
  }

  close(): void {
    // The terminal has been closed. Shutdown the build.
    if (this.fileWatcher) {
      this.fileWatcher.dispose();
    }
  }

  private async doBuild(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.writeEmitter.fire(`[${new Date().toISOString()}] Starting ${this.version} build...\r\n`);

      let iterator = Builder.Build(this.version, this.encryption, this.template);

      let value = null

      try {
        while (value = await iterator.next(), !value.done) {
          this.writeEmitter.fire(`[${new Date().toISOString()}] ${value.value.message}\r\n`);
        }

        this.closeEmitter.fire();

        resolve()
      } catch (err) {
        console.log(err);
        
        this.writeEmitter.fire(`[${new Date().toISOString()}] ${err.message}\r\n`);

        this.closeEmitter.fire();

        resolve()
      }
    })
  }
}