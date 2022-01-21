'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { C4Action, C4Property } from '../../control4';
import { TreeNode } from './TreeNode';

export default class ActionNode extends TreeNode<C4Action> {
    constructor(name: string, action: C4Action) {
        super(name, action, "code", action.params && action.params.length == 0);
    }

    contextValue = "action";
}