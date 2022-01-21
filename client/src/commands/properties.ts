'use strict';

import * as vscode from 'vscode';

export async function selectProperty(element) {
    const p = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'components', 'properties.c4c');

    var td : vscode.TextDocument = await vscode.workspace.openTextDocument(p);
    console.log(element.name);
    
    var text = td.getText();
    var properties = JSON.parse(text);

    var property = null;

    for (var i = 0; i < properties.length; i++) {
        if (properties[i].name == element.name) {
            property = properties[i];
        }
    }

    vscode.commands.executeCommand('control4.viewProperty', property);
}