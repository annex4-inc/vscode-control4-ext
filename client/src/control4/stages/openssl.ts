import { BuildStage } from '../builder';
import openssl from 'openssl';
import * as path from 'path';
import { ReadFileContents } from '../../utility';
import * as vscode from 'vscode';

export default class OpenSSLStage implements BuildStage {
    encrypted: boolean
    certificatePath: string

    constructor(encrypted: boolean, certificatePath: string) {
        this.encrypted = encrypted;
        this.certificatePath = certificatePath
    }

    Execute(source: string, intermediate: string, destination: string): Promise<any> {
        if (!this.encrypted) { return }

        return new Promise<any>(async (resolve, reject) => {
            let input = path.join(intermediate, "driver.lua");
            let output = path.join(intermediate, "driver.lua.encrypted");

            let request = {
                verb: "smime",
                flags:  `-encrypt -binary -aes-256-cbc -in ${input} -out ${output} -outform DER`,
                tail: `${this.certificatePath}`
            }

            try {
                let result = await openssl(request);

                console.log(result);

                if (result && result.stderr !== "") {
                    reject({message: result.stderr})
                } else {
                    resolve(result.stdout)
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    OnSuccess(result) {
        if (result) {
            return "[OpenSSL     ] Encrypted";
        } else {
            return "[OpenSSL     ] Skipped";
        }
    }

    OnFailure(result) {
        return `[OpenSSL     ] Failed to encrypt driver\r\n${result.message}`;
    }
}