'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { C4Command } from '../../control4';
import { TreeNode } from './TreeNode';

export default class CommandNode extends TreeNode<C4Command> {
    constructor(name: string, command: C4Command) {
        super(name, command, "terminal-cmd", command.params && command.params.length == 0);
        
        this.tooltip = command.description;
        this.description = command.description;
        
    }

    getNameOfType() {
        return "C4Command"
    }

    contextValue = "command";
}