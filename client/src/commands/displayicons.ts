'use strict';

import * as vscode from 'vscode';

export async function selectDisplayIcon(element) {
    const p = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'components', 'displayicons.c4c');

    var td : vscode.TextDocument = await vscode.workspace.openTextDocument(p);
    console.log(element.name);
    
    var text = td.getText();
    var displayicons = JSON.parse(text);

    var displayicon = null;

    for (var i = 0; i < displayicons.length; i++) {
        if (displayicons[i].name == element.name) {
            displayicon = displayicons[i];
        }
    }

    vscode.commands.executeCommand('control4.viewDisplayIcon', displayicon);
}