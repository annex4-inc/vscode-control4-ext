
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

@jsonObject
export default class C4InterfaceTrait {
    name: string

    @jsonMember
    property: string

    @jsonArrayMember(String)
    values: string[]
    
    toXml() {
        let node = builder.create(this.name).root();

        node.ele("Property", this.property);
        node.ele("ValidValues", this.values);
                
        return node;
    }

    static fromXml(obj) : C4InterfaceTrait {
      let i = new C4InterfaceTrait();
  
      i.property = obj["Property"]
      i.values = obj["ValidValues"]
  
      return i
    }
}