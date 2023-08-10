'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { C4NavDisplayOption } from '../../control4/capabilities/C4NavDisplayOption'
import { NavDisplayOptionType } from '../../control4/capabilities/C4NavigatorDisplayOption';

export class NavDisplayOptionNode extends TreeNode<C4NavDisplayOption> {
    constructor(name: string, navdisplayoption: C4NavDisplayOption) {
        
        let navIcon = "";
        
        switch (navdisplayoption.type) {
            case NavDisplayOptionType.PROXY:
                navIcon = "type-hierarchy";
                break;
            case NavDisplayOptionType.TRANSLATIONS_URL:
                navIcon = "globe";
                break;
            default:
                navIcon = "device-camera";
                break;
        }

        super(name, navdisplayoption, navIcon, navdisplayoption.sizes && navdisplayoption.sizes.length == 0);

        this.description = navdisplayoption.type;
        this.tooltip = navdisplayoption.type;
    }


    getNameOfType() {
        return "C4NavDisplayOption"
    }

    contextValue = "navdisplayoption";
}