import * as vscode from 'vscode';
import * as path from 'path';
import ActionNode from './ActionNode';
import { C4Action } from '../../control4/C4Action'
import { TreeNodeProvider } from './TreeNodeProvider';
import { TypedJSON } from 'typedjson';
import { ParameterNode } from './ParameterNode';

export class ActionNodeProvider extends TreeNodeProvider<ActionNode> {
    private _componentPath: string

    constructor(workspaceRoot: string) {
        super(workspaceRoot);

        this._componentPath = path.join(workspaceRoot, 'components', 'actions.c4c');

        this.watchFile('actions.c4c');
    }

    getChildren(element?: ActionNode): Thenable<ActionNode[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }

        try {
            if (element) {
                var params = [];
                
                if (!element.data.params) {
                    return;
                }

                for (var i = 0; i < element.data.params.length; i++) {
                    let e = element.data.params[i]

                    params.push(new ParameterNode(e.name, e, element));
                }
    
                return Promise.resolve(params);
            } else {
                return this.getNodes(this._componentPath);
            }
        } catch (err) {
            console.log(err)
        }
    }

    getComponent(action: C4Action): ActionNode {
        try {
            return new ActionNode(action.name, action);
        } catch (err) {
            console.log(err)
        }
    }

    resolveTypes(components) {
        return TypedJSON.parseAsArray<C4Action>(components, C4Action);
    }
}