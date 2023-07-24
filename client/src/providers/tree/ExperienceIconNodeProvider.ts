import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ExperienceIconNode } from './ExperienceIconNode';
import { StringNode } from './StringNode';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4ExperienceIcon } from '../../control4/C4ExperienceIcon'
import { TypedJSON } from 'typedjson';

export class ExperienceIconNodeProvider extends TreeNodeProvider<ExperienceIconNode> {
  private _componentPath: string

  constructor(workspaceRoot: string) {
    super(workspaceRoot);

    this._componentPath = path.join(workspaceRoot, 'components', 'experienceicons.c4c');

    this.watchFile('experienceicons.c4c');
  }

  getChildren(element?: ExperienceIconNode): Thenable<ExperienceIconNode[]> {
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

  getComponent(c4icon: C4ExperienceIcon): ExperienceIconNode {
    try {
      return new ExperienceIconNode(c4icon.name, c4icon);
    } catch (err) {
      console.log(err)
    }
  }

  resolveTypes(components) {
    return TypedJSON.parseAsArray<C4ExperienceIcon>(components, C4ExperienceIcon);
  }
}