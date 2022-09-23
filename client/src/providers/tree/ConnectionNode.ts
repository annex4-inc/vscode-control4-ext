'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { C4Connection } from "../../control4"
import { TreeNode } from "./TreeNode"

export class ConnectionNode extends TreeNode<C4Connection> {
    constructor(name: string, connection: C4Connection) {
        super(name, connection, "link", !(connection.proxybindingid == undefined && (connection.id >= 5000 && connection.id <= 5999)));

        if (connection.total) {
          this.description = `[${connection.id} - ${connection.id + connection.total - 1}] ${connection.consumer ? "Input" : "Output"}`;

          this.label = name.replace("%INDEX%", `[1 to ${connection.total}]`);
        } else {
          this.description = `[${connection.id}] ${connection.consumer ? "Input" : "Output"}`;
        }

        if (connection.classes && connection.classes.length > 0) {
            this.description = `${this.description} (${connection.classes.map((c) => {return c.classname}).join(", ")})`;
        }
        
        this.tooltip = `${connection.id}`;
    }


    getNameOfType() {
        return "C4Connection"
    }

    contextValue = "connection";
}