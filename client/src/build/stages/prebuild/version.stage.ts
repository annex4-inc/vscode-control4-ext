import * as vscode from 'vscode';

import { BuildStage } from '../../builder';
import { StartProcess } from '../../../utility';

export default class IncrementVersionStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Version", task, pkg, ctx) }

    async Execute(_source: string, _intermediate: string, _destination: string): Promise<any> {
        let result = await StartProcess("npm", ["version", "--no-git-tag-version", "patch"]) as string;
        
        //@ts-ignore
        this.pkg.version = result.slice(1);

        return result;
    }

    OnSuccess(result: any): String {
        if (result) {
            return `${result}`;
        }
    }

    OnFailure(result: any): String {
        return "Failed to increment driver version";
    }

    IsEnabled(): Boolean {
        return vscode.workspace.getConfiguration('control4.build').get<boolean>('autoIncrementVersion');
    }
}

