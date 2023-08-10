import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { NavDisplayOptionNode } from './NavDisplayOptionNode';
import { StringNode } from './StringNode';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4NavDisplayOption } from '../../control4/capabilities/C4NavDisplayOption'
import { TypedJSON } from 'typedjson';

export class NavDisplayOptionNodeProvider extends TreeNodeProvider<NavDisplayOptionNode> {
  private _componentPath: string

  constructor(workspaceRoot: string) {
    super(workspaceRoot);

    this._componentPath = path.join(workspaceRoot, 'components', 'navdisplayoptions.c4c');

    this.watchFile('navdisplayoptions.c4c');
  }

  getChildren(element?: NavDisplayOptionNode): Thenable<NavDisplayOptionNode[]> {
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

  getComponent(navdisplayoption: C4NavDisplayOption): NavDisplayOptionNode {
    try {
      return new NavDisplayOptionNode(navdisplayoption.id, navdisplayoption);
    } catch (err) {
      console.log(err)
    }
  }

  resolveTypes(components) {
    return TypedJSON.parseAsArray<C4NavDisplayOption>(components, C4NavDisplayOption);
  }
}