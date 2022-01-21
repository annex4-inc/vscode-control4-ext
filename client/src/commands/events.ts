'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export async function selectEvent(element) {
    var td : vscode.TextDocument = await vscode.workspace.openTextDocument(path.join(vscode.workspace.rootPath, 'components', 'events.c4c'));

    console.log(element.name);

    var editor = vscode.window.visibleTextEditors[0];

    vscode.window.showTextDocument(td);
    //vscode.window.visibleTextEditors[0].revealRange();
}