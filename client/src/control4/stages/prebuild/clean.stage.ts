import { BuildStage } from '../../builder';
import * as fs from 'fs';

export default class CleanStage extends BuildStage {
  constructor(task, pkg, ctx) { super("Clean", task, pkg, ctx) }

  Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await fs.promises.rm(intermediate, { recursive: true, force: true })

        resolve(intermediate);
      } catch (err) {
        reject(err)
      }
    })
  }

  OnSuccess(result: any): String {
    return `Delete ${result}`;
  }

  OnFailure(result: any): String {
    return `Failed to clean intermediate build folder: \r\n${result.message}`;
  }

  IsEnabled(): Boolean {
    return true;
  }
}

