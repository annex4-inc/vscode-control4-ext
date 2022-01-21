'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

export async function selectCommand(element) {
    var td : vscode.TextDocument = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'components', 'commands.c4c'));

    vscode.window.showTextDocument(td);
}