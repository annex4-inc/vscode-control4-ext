import * as vscode from 'vscode';
import * as path from 'path';

import { BuildStage } from '../../builder';
import { ForceWrite } from '../../../utility';
import AdmZip from 'adm-zip'

export default class ZipStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Zip", task, pkg, ctx) }

    async Execute(_source: string, intermediate: string, destination: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            var zip = new AdmZip();
                zip.addLocalFolder(intermediate);
    
            try {
                let zipPath = path.resolve(destination, `${this.pkg.name}.c4z`);

                await ForceWrite(zipPath, zip.toBuffer());

                resolve(zipPath)
            } catch (err) {
                reject(err);
            }
        })
    }

    OnSuccess(result: any): String {
        vscode.window.showInformationMessage(`"${this.pkg.name}.c4z" built at ${new Date().toLocaleTimeString()}`, { modal: false }, "Open Folder", "Ok").then(selection => {
            if (selection === "Open Folder") {
              vscode.env.openExternal(vscode.Uri.file(result));
            }
        });

        return `Created ${result}`;
    }

    OnFailure(result: any): String {
        return `${result.message}`;
    }

    IsEnabled(): Boolean {
        return vscode.workspace.getConfiguration('control4').get<string>('buildMethod') == "OpenSSL"
    }
}



