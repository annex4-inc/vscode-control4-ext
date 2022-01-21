import * as vscode from 'vscode';
import * as path from 'path';
import { ConnectionNode } from './ConnectionNode';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4Connection } from '../../control4/C4Connection';
import { TypedJSON } from 'typedjson';

export class ConnectionNodeProvider extends TreeNodeProvider<ConnectionNode> {
    private _componentPath: string

    constructor(workspaceRoot: string) {
        super(workspaceRoot);

        this._componentPath = path.join(workspaceRoot, 'components', 'connections.c4c');

        this.watchFile('connections.c4c');
    }

    getChildren(element?: ConnectionNode): Thenable<ConnectionNode[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }

        if (!element) {
          return new Promise(async (resolve, reject) => {
            let nodes = await this.getNodes(this._componentPath);
  
            resolve(nodes.filter((e) => {
              return e.data.proxybindingid == undefined
            }))
          })
        } else {
          return new Promise(async (resolve, reject) => {
            let nodes = await this.getNodes(this._componentPath);
  
            resolve(nodes.filter((e) => {
              if (e.data.proxybindingid != undefined) {
                return e.data.proxybindingid == element.data.id
              } else {
                return false
              }
            }))
          })
        }
    }

    getComponent(connection: C4Connection): ConnectionNode {
        try {
            return new ConnectionNode(connection.connectionname, connection);
        } catch (err) {
            console.log(err)
        }
    }

    resolveTypes(components) {
      return TypedJSON.parseAsArray<C4Connection>(components, C4Connection);
    }
}