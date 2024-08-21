import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs'
import * as vscode from 'vscode'
import { BuildStage } from '../../builder';

export default class OpenSSLStage extends BuildStage {
    constructor(task, pkg, ctx) { super("OpenSSL", task, pkg, ctx) }

    Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let certificatePath = this.context.asAbsolutePath(path.join('client', 'src', 'resources', 'certificate.pem'))

        return new Promise<any>(async (resolve, reject) => {
            let input = path.join(intermediate, "driver.lua");
            let output = path.join(intermediate, "driver.lua.encrypted");
            let command = `openssl smime -encrypt -binary -aes-256-cbc -in "${input}" -out "${output}" -outform DER "${certificatePath}"`

            cp.exec(command, { timeout: 3000 }, async (err, stdout, stderr) => {
                if (stderr !== "") {
                    reject({ message: stderr })
                } else {
                    await fs.promises.unlink(path.join(intermediate, "driver.lua"));

                    resolve("Encrypted Driver");
                }
            });
        });
    }

    OnSuccess(result) {
        if (result) {
            return "Encrypted";
        } else {
            return "Skipped";
        }
    }

    OnFailure(result) {
        return `Failed to encrypt driver\r\n${result.message}`;
    }

    IsEnabled(): Boolean {
        return (this.task.encryption && vscode.workspace.getConfiguration('control4').get<string>('buildMethod') == "OpenSSL") && !this.task.template
    }
}