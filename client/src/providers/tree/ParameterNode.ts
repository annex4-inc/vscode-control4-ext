'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { C4Parameter } from '../../control4';

export class ParameterNode extends TreeNode<C4Parameter> {
    constructor(name: string, parameter: C4Parameter, parentNode: TreeNode<any>) {
        super(name, parameter, "info", true, parentNode);

        this.description = parameter.type;
        this.tooltip = parameter.type;
    }

    contextValue = "parameter";
}
