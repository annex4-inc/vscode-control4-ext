'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export async function selectAction(element) {
    const p : vscode.Uri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'components', 'actions.c4c');
    var td : vscode.TextDocument = await vscode.workspace.openTextDocument(p);
    
    var text = td.getText();
    var actions = JSON.parse(text);

    var action = null;

    for (var i = 0; i < actions.length; i++) {
        if (actions[i].name == element.name) {
            action = actions[i];
        }
    }

    if (action) {
        vscode.commands.executeCommand('control4.viewAction', action);
    }
}