import * as path from 'path';

import { BuildStage } from '../builder';
import { ReadFileContents } from '../../utility';
import axios from 'axios';

export default class LuaDeploymentStage implements BuildStage {
    deploy: {ip: string, port: number}

    constructor(deploy: {ip: string, port: number}) {
        this.deploy = deploy;
    }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);

        if (this.deploy && this.deploy.port && this.deploy.ip) {
            let result = await axios({
                method: 'POST',
                url: `http://${this.deploy.ip}:${this.deploy.port}/lua/update`,
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
            return `[Lua Deploy]: Updated Lua Code`;
        }
    }

    OnFailure(result: any): String {
        return `[Lua Deploy] Failed to deploy ${result.message}`;
    }
}



