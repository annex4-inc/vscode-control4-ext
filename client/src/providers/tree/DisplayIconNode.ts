'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { C4DisplayIcon, DisplayIconType } from '../../control4/capabilities/C4DisplayIcon'

export class DisplayIconNode extends TreeNode<C4DisplayIcon> {
    constructor(name: string, displayicon: C4DisplayIcon) {
        
        let navIcon = "";
        
        switch (displayicon.type) {
            case DisplayIconType.PROXY:
                navIcon = "type-hierarchy";
                break;
            case DisplayIconType.TRANSLATIONS_URL:
                navIcon = "globe";
                break;
            default:
                navIcon = "device-camera";
                break;
        }

        super(name, displayicon, navIcon, displayicon.sizes && displayicon.sizes.length == 0);

        this.description = displayicon.type;
        this.tooltip = displayicon.type;
    }


    getNameOfType() {
        return "C4DisplayIcon"
    }

    contextValue = "displayicon";
}