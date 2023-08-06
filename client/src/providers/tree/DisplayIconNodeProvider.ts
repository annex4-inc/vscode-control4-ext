import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DisplayIconNode } from './DisplayIconNode';
import { StringNode } from './StringNode';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4DisplayIcon } from '../../control4/capabilities/C4DisplayIcon'
import { TypedJSON } from 'typedjson';

export class DisplayIconNodeProvider extends TreeNodeProvider<DisplayIconNode> {
  private _componentPath: string

  constructor(workspaceRoot: string) {
    super(workspaceRoot);

    this._componentPath = path.join(workspaceRoot, 'components', 'displayicons.c4c');

    this.watchFile('displayicons.c4c');
  }

  getChildren(element?: DisplayIconNode): Thenable<DisplayIconNode[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }

    try {
      if (element) {
        var params = [];

        if (!element.data.sizes) {
          return;
        }

        for (var i = 0; i < element.data.sizes.length; i++) {
          let e = element.data.sizes[i]

          params.push(new StringNode(e.toString()));
        }

        return Promise.resolve(params);
      } else {
        return this.getNodes(this._componentPath);
      }
    } catch (err) {
      console.log(err)
    }
  }

  getComponent(displayicon: C4DisplayIcon): DisplayIconNode {
    try {
      return new DisplayIconNode(displayicon.id, displayicon);
    } catch (err) {
      console.log(err)
    }
  }

  resolveTypes(components) {
    return TypedJSON.parseAsArray<C4DisplayIcon>(components, C4DisplayIcon);
  }
}