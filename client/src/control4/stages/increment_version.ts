import * as vscode from 'vscode';

import { BuildStage } from '../builder';
import { StartProcess } from '../../utility';

export default class IncrementVersionStage implements BuildStage {
    Execute(source: string, intermediate: string, destination: string): Promise<any> {
        const increment = vscode.workspace.getConfiguration('control4.build').get<boolean>('autoIncrementVersion');

        if (increment) {
            return StartProcess("npm", ["version", "--no-git-tag-version", "patch"])
        }
    }

    OnSuccess(result: any): String {
        if (result) {
            return `[Version     ] Incrementing driver version to ${result}`;
        }
    }

    OnFailure(result: any): String {
        return "[Version     ] Failed to increment driver version";
    }
}

