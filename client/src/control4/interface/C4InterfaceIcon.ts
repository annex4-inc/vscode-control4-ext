
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt } from '../driver';


@jsonObject
export default class C4InterfaceIcon {
    @jsonMember
    height: number

    @jsonMember
    width: number

    @jsonMember
    path: string

    toXml() {
        let node = builder.create("Icon").root();

        node.att("height", this.height.toString());
        node.att("width", this.width.toString());
        node.txt(this.path);
                
        return node;
    }

    static fromXml(obj) : C4InterfaceIcon {
      let i = new C4InterfaceIcon()
  
      i.height = asInt(obj["@height"])
      i.width = asInt(obj["@width"])
      i.path = obj["#"]
  
      return i
    }
}