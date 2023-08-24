import { BuildStage } from '../../builder';
import * as path from 'path';

export default class DependencyInjectionStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Dependencies", task, pkg, ctx) }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let modules = await this.pkg.getDependencyOrder(this.task.development);

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
            return `${result.join(", ")}`;
        }
    }

    OnFailure(result: any): String {
        return "Failed to inject dependencies";
    }

    IsEnabled(): Boolean {
        return true;
    }
}



