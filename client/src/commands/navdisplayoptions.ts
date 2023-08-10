'use strict';

import * as vscode from 'vscode';

export async function selectNavDisplayOption(element) {
    const p = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'components', 'navdisplayoptions.c4c');

    var td : vscode.TextDocument = await vscode.workspace.openTextDocument(p);
    console.log(element.name);
    
    var text = td.getText();
    var navdisplayoptions = JSON.parse(text);

    var navdisplayoption = null;

    for (var i = 0; i < navdisplayoptions.length; i++) {
        if (navdisplayoptions[i].name == element.name) {
            navdisplayoption = navdisplayoptions[i];
        }
    }

    vscode.commands.executeCommand('control4.viewNavDisplayOption', navdisplayoption);
}