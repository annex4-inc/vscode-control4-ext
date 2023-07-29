'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { C4Event } from '../../control4';
import { TreeNode } from './TreeNode';

export default class EventNode extends TreeNode<C4Event> {
    constructor(name: string, event: C4Event) {
        super(name, event, "symbol-event")
        
        this.description = `[${event.id}] ${event.description}`;
        this.tooltip = event.description;
    }


    getNameOfType() {
        return "C4Event"
    }

    contextValue = "event";
}