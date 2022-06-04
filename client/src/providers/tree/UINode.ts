'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { C4UI } from '../../control4';
import { TreeNode } from './TreeNode';

export default class UINode extends TreeNode<C4UI> {
    constructor(name: string, ui: C4UI) {
        super(name, ui, "symbol-interface", false)

        this.description = ui.proxy.toString();
        this.tooltip = ui.proxy.toString();
    }

    getNameOfType() {
        return "C4UI"
    }

    contextValue = "ui";
}