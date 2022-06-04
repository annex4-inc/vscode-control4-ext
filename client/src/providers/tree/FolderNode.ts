'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';

export default class FolderNode extends TreeNode<any> {
    constructor(name: string, description: string, data: any) {
        super(name, data, "folder", false)

        this.description = description;
    }

    
    getNameOfType() {
        return "C4Command"
    }

    contextValue = "folder";
}