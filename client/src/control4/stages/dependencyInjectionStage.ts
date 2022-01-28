
import { BuildStage } from '../builder';
import Package from '../../package';
import * as path from 'path';

export default class DependencyInjectionStage implements BuildStage {
    pkg: Package

    constructor(pkg: Package) {
        this.pkg = pkg;
    }

    async Execute(source: string, intermediate: string, destination: string): Promise<any> {
        let modules = await this.pkg.getDependencyOrder();

        await this.pkg.injectDependencies(modules || [], path.join(intermediate, 'driver.lua'));

        if (modules) {
          return modules;
        } else {
          return "[Dependencies] No dependencies detected"
        }
    }

    OnSuccess(result: any): String {
        if (typeof(result) === "string") {
            return result;
        } else {
            return `[Dependencies]:\r\n\t${result.join("\r\n\t")}`;
        }
    }

    OnFailure(result: any): String {
        return "[Dependencies] Failed to inject dependencies";
    }
}



