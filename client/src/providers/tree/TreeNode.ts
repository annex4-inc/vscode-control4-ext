import * as vscode from 'vscode';
import { TypedJSON } from 'typedjson';

export abstract class TreeNode<T> extends vscode.TreeItem {
  data: T
  parentNode: TreeNode<any>

  constructor(label: string, data: T, icon: string = "circle-filled", hasCommand: boolean = true, parentNode = null) {
    super(label, hasCommand ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);

    this.label = label;
    this.iconPath = new vscode.ThemeIcon(icon, new vscode.ThemeColor("icon.foreground"));
    this.data = data;
    this.parentNode = parentNode;

    if (this.data) {
      try {
        this.command = {
          title: "Select",
          command: `select.${this.getNameOfType()}`,
          arguments: [data, parentNode]
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  /**
   * @returns The name of the generic type of data for this node
   */
  abstract getNameOfType(): String
}