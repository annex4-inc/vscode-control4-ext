'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { C4ExperienceIcon } from '../../control4'

export class ExperienceIconNode extends TreeNode<C4ExperienceIcon> {
    constructor(name: string, experienceicons: C4ExperienceIcon) {
        super(name, experienceicons, "device-camera", experienceicons.sizes && experienceicons.sizes.length == 0);

        this.description = experienceicons.type;
        this.tooltip = experienceicons.type;
    }


    getNameOfType() {
        return "C4ExperienceIcon"
    }

    contextValue = "experienceicons";
}