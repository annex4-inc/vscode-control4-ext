'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import data from './resources/hooks.json';

var arr = new Array(0);

var hooks = data as any;

// Construct completion items
hooks.forEach(element => {
    var ci = new vscode.CompletionItem(element.label, element.kind);

    ci.detail = element.detail;
    ci.documentation = element.documentation;
    ci.insertText = new vscode.SnippetString(element.insertText);

    arr.push(ci);
});

export const Hooks = new vscode.CompletionList(arr);