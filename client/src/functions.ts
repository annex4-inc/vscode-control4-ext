'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import data from './resources/functions.json';

var arr = new Array(0);

var functions = data as any;

// Construct completion items
functions.forEach(element => {
    var ci = new vscode.CompletionItem(element.label, element.kind);

    ci.detail = element.detail;
    ci.documentation = element.documentation;
    ci.insertText = new vscode.SnippetString(element.insertText);

    arr.push(ci);
});

export const Functions = new vscode.CompletionList(arr);