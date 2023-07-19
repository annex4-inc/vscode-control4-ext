import { BuildStage } from '../builder';
import * as fs from 'fs';
import * as fse from 'fs-extra';

export default class CleanStage implements BuildStage {
  Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await fs.promises.rm(intermediate, { recursive: true })

        resolve(true);
      } catch (err) {
        reject(err)
      }
    })
  }

  OnSuccess(result: any): String {
    return `[Clean] Intermediate build folder cleaned`;
  }

  OnFailure(result: any): String {
    return `[Clean] Failed to clean intermediate build folder: \r\n${result.message}`;
  }
}

