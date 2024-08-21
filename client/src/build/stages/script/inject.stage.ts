import * as path from 'path';
import { BuildStage } from '../../builder';
import { ReadFileContents, WriteFileContents } from '../../../utility';

export default class InjectionStage extends BuildStage {
    constructor(task, pkg, ctx) { super("Inject", task, pkg, ctx) }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);

        let injections = [
            "C4:AllowExecute(true)",
            //"gIsDevelopmentVersionOfDriver = true",
            "\r\n"
        ]

        let src = injections.join("\r\n") + srcDocument;

        await WriteFileContents(srcFile, src);
    }

    OnSuccess(result: any): String {
        if (typeof(result) === "string") {
            return result;
        } else {
            return `Injected C4:AllowExecute()`;
        }
    }

    OnFailure(result: any): String {
        return "Failed to C4:AllowExecute()";
    }

    IsEnabled(): Boolean {
        return this.task.development
    }
}



