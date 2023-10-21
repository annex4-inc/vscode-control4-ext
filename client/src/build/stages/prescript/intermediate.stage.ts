import { BuildStage } from '../../builder';
import * as fse from 'fs-extra';

export default class IntermediateStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Intermediate", task, pkg, ctx) }

    Execute(source: string, intermediate: string, _destination: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                fse.copy(source, intermediate, {
                    filter: (i: string) => {
                        if (!this.task.merge && !this.task.encryption) {
                            return true
                        }

                        return i.indexOf("\\src\\lib") == -1;
                    }
                }, async (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(intermediate)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    OnSuccess(result: any): String {
        return `Created ${result}`;
    }

    OnFailure(result: any): String {
        return `Failed to copy files into intermediate build folder\r\n${result.message}`;
    }

    IsEnabled(): Boolean {
        return true;
    }
}

