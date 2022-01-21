
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceDataCommand from './C4InterfaceDataCommand';
import C4InterfaceList from './C4InterfaceList';

@jsonObject
export default class C4InterfaceScreen {
    @jsonMember
    id: string

    @jsonMember
    type: string
    
    @jsonMember
    dataCommand: C4InterfaceDataCommand

    @jsonMember
    paginationStyle: string

    @jsonMember
    list: C4InterfaceList

    toXml() {
        let node = builder.create("Screen").root();

        node.att("type", this.type);
        node.ele(this.id);
                
        return node;
    }

    static fromXml(obj) : C4InterfaceScreen {
      let i = new C4InterfaceScreen()
  
      i.type = obj["@type"]
      i.id = obj["Id"];
  
      return i
    }
}