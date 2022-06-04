'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';

export class StringNode extends TreeNode<String> {
  constructor(name: string) {
    super(name, null);
  }

  
  getNameOfType() {
    return "String"
}

  contextValue = "string";
}
