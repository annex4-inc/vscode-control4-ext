import { BuildStage } from '../builder';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs'
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

            cp.exec(`openssl smime -encrypt -binary -aes-256-cbc -in ${input} -out ${output} -outform DER ${this.certificatePath}`,
                {timeout: 3000}, async (err, stdout, stderr) => {
                if (stderr !== "") {
                    reject({message: stderr})
                } else {
                    await fs.promises.unlink(path.join(intermediate, "driver.lua"));

                    resolve("Encrypted Driver");
                }
            });

            //

            /*let request = {
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
            }*/
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