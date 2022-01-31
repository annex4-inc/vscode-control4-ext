import * as vscode from 'vscode';
import * as path from 'path';
import CommandNode from './CommandNode';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4Command, C4Parameter } from '../../control4';
import { TypedJSON } from 'typedjson';
import { ParameterNode } from './ParameterNode';
import { StringNode } from './StringNode';

export class CommandNodeProvider extends TreeNodeProvider<CommandNode> {
    private _componentPath: string

    constructor(workspaceRoot: string) {
        super(workspaceRoot);

        this._componentPath = path.join(workspaceRoot, 'components', 'commands.c4c');

        this.watchFile('commands.c4c');
    }

    getChildren(element?: CommandNode): Thenable<CommandNode[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }

        try {
            console.log(element)

            if (element && element.data instanceof C4Parameter) {
                var params = [];

                for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i]
          
                    params.push(new StringNode(e));
                  }

                return Promise.resolve(params);
            } else if (element && element.data instanceof C4Command) {
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

    getComponent(command: C4Command): CommandNode {
        try {
            return new CommandNode(command.name, command);
        } catch (err) {
            console.log(err)
        }
    }

    resolveTypes(components) {
        return TypedJSON.parseAsArray<C4Command>(components, C4Command);
    }
}