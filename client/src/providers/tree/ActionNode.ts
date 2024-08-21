'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { C4Action } from '../../control4';
import { TreeNode } from './TreeNode';

export default class ActionNode extends TreeNode<C4Action> {
    constructor(name: string, action: C4Action) {
        super(name, action, "github-action", action.params && action.params.length == 0);

        this.description = action.command;
        this.tooltip = action.command;
    }

    getNameOfType() {
        return "C4Action"
    }

    contextValue = "action";
}