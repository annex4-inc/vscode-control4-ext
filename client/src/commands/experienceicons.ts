'use strict';

import * as vscode from 'vscode';

export async function selectExperienceIcon(element) {
    const p = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'components', 'experienceicons.c4c');

    var td : vscode.TextDocument = await vscode.workspace.openTextDocument(p);
    console.log(element.name);
    
    var text = td.getText();
    var experienceicons = JSON.parse(text);

    var experienceicon = null;

    for (var i = 0; i < experienceicons.length; i++) {
        if (experienceicons[i].name == element.name) {
            experienceicon = experienceicons[i];
        }
    }

    vscode.commands.executeCommand('control4.viewExperienceIcon', experienceicon);
}