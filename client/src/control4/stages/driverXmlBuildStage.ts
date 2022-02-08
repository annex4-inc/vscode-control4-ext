import { BuildStage } from '../builder';
import { Driver } from '../driver';
import Package from '../../package';
import { WriteFileContents } from '../../utility';
import * as path from 'path';

export default class DriverXmlBuildStage implements BuildStage {
    driver: Driver
    pkg: Package
    encrypted: boolean

    constructor(pkg: Package, encrypted: boolean) {
        this.pkg = pkg;
        this.encrypted = encrypted;
    }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        this.driver = await Driver.From(this.pkg);
        this.driver.encrypted = this.encrypted;
        
        let content = this.driver.build();
        
        return await WriteFileContents(path.join(intermediate, "driver.xml"), content);
    }

    OnSuccess(result: any): String {
        return `[Driver      ] Built driver.xml`;
    }

    OnFailure(result: any): String {
        return "[Driver      ] Failed to build driver.xml";
    }
}



