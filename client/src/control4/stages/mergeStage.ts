
import * as path from 'path';
import { BuildStage } from '../builder';
import { ReadFileContents, WriteFileContents } from '../../utility';

export default class MergeStage implements BuildStage {
    constructor() {
    }

    regExpEscape(literal_string) {
        return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
    }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);

        let r = new RegExp(/require\s*?[\[\[]*?['"(]+(.+)['"]+\)/, "gm");
        let matches = srcDocument.matchAll(r);
        let modules = ""

        // Create module data
        for (const match of matches) {
            let fileDocument = await ReadFileContents(path.join(_source, ... match[1].split('.')) + ".lua");

            modules = modules + `package.preload['${match[1]}'] = (function(...)\n ${fileDocument} end)\n`
        }

        srcDocument = modules + srcDocument;

        await WriteFileContents(srcFile, srcDocument);
    }

    OnSuccess(result: any): String {
        if (typeof(result) === "string") {
            return result;
        } else {
            return `[Lua Merge   ] Injected lua source from files`;
        }
    }

    OnFailure(result: any): String {
        return "[Lua Merge   ] Failed to inject lua source";
    }
}



