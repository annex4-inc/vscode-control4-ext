'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { C4ExperienceIcon } from '../../control4'

export class ExperienceIconNode extends TreeNode<C4ExperienceIcon> {
    constructor(name: string, c4icon: C4ExperienceIcon) {
        super(name, c4icon, "info", c4icon.items && c4icon.items.length == 0);

        this.description = c4icon.type;
        this.tooltip = c4icon.type;
    }


    getNameOfType() {
        return "C4ExperienceIcon"
    }

    contextValue = "c4icon";
}