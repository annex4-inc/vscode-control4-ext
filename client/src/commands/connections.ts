'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

export async function selectConnection(element) {
    var td : vscode.TextDocument = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'components', 'connections.c4c'));

    console.log(element.name);

    var editor = vscode.window.visibleTextEditors[0];

    vscode.window.showTextDocument(td);
    //vscode.window.visibleTextEditors[0].revealRange();
}