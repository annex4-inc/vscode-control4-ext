import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { TypedJSON } from 'typedjson';

export interface NodeEvents<T> {
  onSelectNode?: vscode.Event<T>;
  onRemoveNode?: vscode.Event<T>;
}

export abstract class TreeNodeProvider<T> implements vscode.TreeDataProvider<T>, NodeEvents<T>  {
  private _onDidChangeTreeData: vscode.EventEmitter<T | undefined | void> = new vscode.EventEmitter<T | undefined | void>();
  private _onSelectNode: vscode.EventEmitter<T> = new vscode.EventEmitter<T>();
  private _onRemoveNode: vscode.EventEmitter<T> = new vscode.EventEmitter<T>();

  private watcher: vscode.FileSystemWatcher

  protected file: String

  public onSelectNode: vscode.Event<T> = this._onSelectNode.event;
  public onRemoveNode: vscode.Event<T> = this._onRemoveNode.event;
  public onDidChangeTreeData: vscode.Event<T | undefined | void> = this._onDidChangeTreeData.event;

  constructor(protected workspaceRoot: string) {
    //this.onRemoveNode((n) => { console.log("onRemoveNode.handler"); this.refresh();})
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element): vscode.TreeItem {
    return element;
  }

  public register(treeView, selectCommand, removeCommand): vscode.Disposable[] {
    return [
      vscode.window.registerTreeDataProvider(treeView, this),
      vscode.commands.registerCommand(selectCommand, this.onSelect, this),
      vscode.commands.registerCommand(removeCommand, this.onRemove, this)
    ]
  }

  protected watchFile(file) {
    this.watcher = vscode.workspace.createFileSystemWatcher(`**/${file}`, false, false, false);

    this.watcher.onDidChange(() => { this.refresh(); });
    this.watcher.onDidCreate(() => { this.refresh(); });
    this.watcher.onDidDelete(() => { this.refresh(); });

    this.file = file;
  }

  protected async getNodes(component) {
    try {
      let td: vscode.TextDocument = await vscode.workspace.openTextDocument(component);
      let components = [];

      try {
        components = JSON.parse(td.getText());
      } catch (err) {
        vscode.window.showErrorMessage(`Bad JSON in component ${this.file}`, "Show", "Ok").then(value => {
          if (value == "Show") {
            vscode.window.showTextDocument(td);
          }
        });

        return [];
      }

      if (this.resolveTypes) {
        components = this.resolveTypes(components);
      }

      var ret = [];

      if (components && components.length > 0) {
        for (var i = 0; i < components.length; i++) {
          ret.push(this.getComponent(components[i]));
        }
      }

      return ret;
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  }

  protected onSelect(entity: T) {
    this._onSelectNode.fire(entity);
  }

  protected onRemove(entity: TreeNode<T>) {
    this._onRemoveNode.fire(entity.data);
  }

  /**
   * Returns all children for a given node or root node
   * @param element 
   */
  abstract getChildren(element: any): Thenable<any[]>;

  /**
   * Should return an object formatted for display in a tree
   * @param component A raw JSON object
   */
  abstract getComponent(component);

  /**
   * Should return the typescript class nodes
   * @param components Deserialzed JSON object
   */
  abstract resolveTypes(components);
}