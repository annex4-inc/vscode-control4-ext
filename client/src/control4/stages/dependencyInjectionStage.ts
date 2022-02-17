
import { BuildStage } from '../builder';
import Package from '../../package';
import * as path from 'path';

export default class DependencyInjectionStage implements BuildStage {
    pkg: Package
    isDevelopment: boolean

    constructor(pkg: Package, isDevelopment) {
        this.pkg = pkg;
        this.isDevelopment = isDevelopment;
    }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let modules = await this.pkg.getDependencyOrder(this.isDevelopment);

        console.log(modules);

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



