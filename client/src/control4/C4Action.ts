
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { C4Parameter } from './C4Parameter'

@jsonObject
export class C4Action {
    @jsonMember
    name: string

    @jsonMember
    command: string

    @jsonArrayMember(C4Parameter)
    params?: C4Parameter[]

    addParameter(parameter: C4Parameter) {
        this.params.push(parameter);
    }

    toXml() {
        let node = builder.create("action").root();
                
        for (const key in this) {
            if (key == "params") {
                let params = node.ele("params");

                this.params.forEach(p => {
                    params.import(p.toXml())
                });
            } else {
                //@ts-ignore
                node.ele(key).txt(this[key]);
            }
        }

        return node;
    }

    static fromXml(obj) : C4Action {
        let a = new C4Action();

        a.name = obj.name
        a.command = obj.commands
        a.params = obj.params.map(function(p) {
            return C4Parameter.fromXml(obj.params)
        }) 

        return a
    }
}