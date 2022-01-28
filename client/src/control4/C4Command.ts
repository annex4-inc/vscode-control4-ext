import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { C4Parameter } from './C4Parameter'

@jsonObject
export class C4Command {
    @jsonMember name: string
    @jsonMember description: string
    @jsonArrayMember(C4Parameter) params?: C4Parameter[]

    addParameter(parameter: C4Parameter) {
        this.params.push(parameter);
    }

    toXml() {
        let node = builder.create("command").root();

        for (const key in this) {
            if (key == "params") {
                let params = node.ele("params");

                this.params.forEach(p => {
                    params.import(p.toXml())
                });
            } else {
                //@ts-ignore
                node.ele(key).txt(this[key])
            }
        }

        return node;
    }

    static fromXml(obj): C4Command {
        let a = new C4Command();

        if (obj.params) {
            let params = obj.params.param
            let parameters = [];

            if (params[0] == undefined) {
                parameters.push(params)
            } else {
                parameters = params;
            }

            a.params = parameters.map((p) => { return C4Parameter.fromXml(p) })
        }

        a.name = obj.name;
        a.description = obj.description;

        return a
    }
}