import * as vscode from 'vscode';
import * as path from 'path';
import EventNode from './EventNode';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4Event } from '../../control4';
import { TypedJSON } from 'typedjson';

export class EventNodeProvider extends TreeNodeProvider<EventNode> {
    private _componentPath: string

    constructor(workspaceRoot: string) {
        super(workspaceRoot);

        this._componentPath = path.join(workspaceRoot, 'components', 'events.c4c');

        this.watchFile('events.c4c');
    }

    getChildren(element?: EventNode): Thenable<EventNode[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }

        return this.getNodes(this._componentPath);
    }

    getComponent(event: C4Event): EventNode {
        try {
            return new EventNode(event.name, event);
        } catch (err) {
            console.log(err)
        }
    }

    resolveTypes(components) {
        return TypedJSON.parseAsArray<C4Event>(components, C4Event);
    }
}