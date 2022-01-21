import * as vscode from 'vscode';
import * as path from 'path';
import CommandNode from './CommandNode';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4Command } from '../../control4';
import { TypedJSON } from 'typedjson';
import { ParameterNode } from './ParameterNode';

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

                var params = [];
                for (var i = 0; i < element.data.params.length; i++) {
                    let e = element.data.params[i]
    
                    if (e.type == "RANGED_INTEGER") {
                        params.push({
                            label: e.name,
                            name: e.name,
                            description: `${e.type} [${e.minimum}-${e.maximum}]`,
                            iconPath: new vscode.ThemeIcon("info", new vscode.ThemeColor("icon.foreground")),
                            command: {
                                command: "command.select",
                                title: "Select Command",
                                arguments: [e]
                            }
                        })
                    } else {
                        params.push({
                            label: e.name,
                            name: e.name,
                            description: e.type,
                            iconPath: new vscode.ThemeIcon("info", new vscode.ThemeColor("icon.foreground")),
                            command: {
                                command: "command.select",
                                title: "Select Command",
                                arguments: [e]
                            }
                        })
                    }
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