import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';

@jsonObject
export class C4Event {
    @jsonMember({deserializer: value => {
      if (typeof(value) == "string") {
        return Number.parseInt(value)
      } else {
        return value;
      }
    }}) id: number
    @jsonMember name: string
    @jsonMember description: string

    toXml() {
        let node = builder.create("event").root();

        for (const key in this) {
            //@ts-ignore
            node.ele(key).txt(this[key])
        }

        return node;
    }
}