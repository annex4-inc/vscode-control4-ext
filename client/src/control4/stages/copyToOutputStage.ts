
import { BuildStage } from '../builder';
import Package from '../../package';

import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

export default class CopyToOutputStage implements BuildStage {
    pkg: Package

    constructor(pkg: Package) {
        this.pkg = pkg;
    }

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
                  // Open the target folder instead of the file iteself.
                  vscode.env.openExternal(vscode.Uri.file(/^.*[\/\\]/.exec(result)[0]));
                }
            });

            return `[CopyOutput  ] Copied to ${result}`;
        }

        return "[CopyOutput  ] Skipped";
    }

    OnFailure(result: any): String {
        vscode.window.showErrorMessage(result.message);

        return `[CopyOutput  ] ${result.message}`;
    }
}






