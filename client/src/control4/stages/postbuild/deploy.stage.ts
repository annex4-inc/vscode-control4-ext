import * as path from 'path';

import { BuildStage } from '../../builder';
import { ReadFileContents } from '../../../utility';
import axios from 'axios';

export default class LuaDeploymentStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Deploy", task, pkg, ctx) }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);

        if (this.task.deploy && this.task.deploy.port && this.task.deploy.ip) {
            let result = await axios({
                method: 'POST',
                url: `http://${this.task.deploy.ip}:${this.task.deploy.port}/lua/update`,
                data: srcDocument,
                timeout: 10000
            })
        } else {
            throw Error("Invalid deployment object");
        }
    }

    OnSuccess(result: any): String {
        if (typeof(result) === "string") {
            return result;
        } else {
            return `Updated Lua Code`;
        }
    }

    OnFailure(result: any): String {
        return `Failed to deploy ${result.message}`;
    }

    IsEnabled(): Boolean {
        return this.task.deploy && !!(this.task.deploy.port && this.task.deploy.ip)
    }
}



