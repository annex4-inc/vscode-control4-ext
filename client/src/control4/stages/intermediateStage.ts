import { BuildStage } from '../builder';
import * as fse from 'fs-extra';

export default class IntermediateStage implements BuildStage {
    encrypted: boolean

    constructor(encrypted: boolean) {
        this.encrypted = encrypted;
    }

    Execute(source: string, intermediate: string, _destination: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                // Copy from source to intermediate
                fse.copy(source, intermediate, {
                    filter: (i: string) => {
                        if (!this.encrypted) {
                            return true
                        }

                        return i.indexOf("\\src\\lib") == -1;
                    }
                }, async (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    OnSuccess(result: any): String {
        return `[Intermediate] Copied files into intermediate build folder`;
    }

    OnFailure(result: any): String {
        return `[Intermediate] Failed to copy files into intermediate build folder\r\n${result.message}`;
    }
}

