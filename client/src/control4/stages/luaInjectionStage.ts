
import * as path from 'path';
import { BuildStage } from '../builder';
import { ReadFileContents, WriteFileContents } from '../../utility';

export default class LuaInjectionStage implements BuildStage {
    constructor() {
    }

    async Execute(source: string, intermediate: string, destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);

        let injections = [
            "C4:AllowExecute(true)",
            "gIsDevelopmentVersionOfDriver = true",
            "\r\n"
        ]

        let src = injections.join("\r\n") + srcDocument;

        await WriteFileContents(srcFile, src);
    }

    OnSuccess(result: any): String {
        if (typeof(result) === "string") {
            return result;
        } else {
            return `[Lua Injection]: Injected Allow Execute`;
        }
    }

    OnFailure(result: any): String {
        return "[Lua Injection] Failed to inject lua source";
    }
}



