import * as vscode from 'vscode';

import { BuildStage } from '../../builder';
import Manifest from '../../manifest';

export default class ManifestStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Manifest", task, pkg, ctx) }

    async Execute(source: string, intermediate: string, destination: string): Promise<any> {
        let manifest = new Manifest(this.pkg.name);

        manifest.encrypted = this.task.encryption;

        return await manifest.build(source, intermediate, destination, true);
    }

    OnSuccess(result: any): String {
        return `Built ${this.pkg.name}.c4z`;
    }

    OnFailure(result: any): String {
        return `Failed to build ${this.pkg.name}.c4z`;
    }

    IsEnabled(): Boolean {
        return vscode.workspace.getConfiguration('control4').get<string>('buildMethod') == "DriverPackager"
    }
}



