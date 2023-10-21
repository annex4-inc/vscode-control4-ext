import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

import { BuildStage } from '../../builder';

export default class CopyToOutputStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Output", task, pkg, ctx) }

    async Execute(_source: string, _intermediate: string, destination: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                if (vscode.workspace.getConfiguration('control4.build').get<boolean>('exportToDriverLocation')) {
                    let root = (this.pkg.control4 && this.pkg.control4.agent) ? 
                        path.join(process.env.USERPROFILE, "Documents", "Control4", "Agents") :
                        path.join(process.env.USERPROFILE, "Documents", "Control4", "Drivers")
            
                    let dst_file = path.join(root, this.pkg.name + ".c4z")
                    let src_file = path.join(destination, this.pkg.name + ".c4z")
    
                    await fs.promises.copyFile(src_file, dst_file);

                    return resolve(dst_file);
                }

                return resolve(false);
            } catch (err) {
                reject(err);
            }
        })
    }

    OnSuccess(result: any): String {
        if (result) {
            vscode.window.showInformationMessage(`"${this.pkg.name}.c4z" built at ${new Date().toLocaleTimeString()}`, { modal: false }, "Open Folder", "Ok").then(selection => {
                if (selection === "Open Folder") {
                  vscode.env.openExternal(vscode.Uri.file(result));
                }
            });

            return `Copied to ${result}`;
        }

        return "Skipped";
    }

    OnFailure(result: any): String {
        vscode.window.showErrorMessage(result.message);

        return `${result.message}`;
    }

    IsEnabled(): Boolean {
        return true
    }
}






