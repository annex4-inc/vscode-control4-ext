import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { PropertyNode } from './PropertyNode';
import { StringNode } from './StringNode';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4Property } from '../../control4/C4Property'
import { TypedJSON } from 'typedjson';

export class PropertyNodeProvider extends TreeNodeProvider<PropertyNode> {
  private _componentPath: string

  constructor(workspaceRoot: string) {
    super(workspaceRoot);

    this._componentPath = path.join(workspaceRoot, 'components', 'properties.c4c');

    this.watchFile('properties.c4c');
  }

  getChildren(element?: PropertyNode): Thenable<PropertyNode[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }

    try {
      if (element) {
        var params = [];

        if (!element.data.items) {
          return;
        }

        for (var i = 0; i < element.data.items.length; i++) {
          let e = element.data.items[i]

          params.push(new StringNode(e));
        }

        return Promise.resolve(params);
      } else {
        return this.getNodes(this._componentPath);
      }
    } catch (err) {
      console.log(err)
    }
  }

  getComponent(property: C4Property): PropertyNode {
    try {
      return new PropertyNode(property.name, property);
    } catch (err) {
      console.log(err)
    }
  }

  resolveTypes(components) {
    return TypedJSON.parseAsArray<C4Property>(components, C4Property);
  }
}