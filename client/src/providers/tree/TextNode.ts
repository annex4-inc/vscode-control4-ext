'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';

export default class TextNode extends TreeNode<any> {
    constructor(name: string, description: string, image: string, data: any) {
        super(name, data, image, true)

        this.description = description;
    }

    
    getNameOfType() {
        return "any"
    }

    contextValue: "text"
}