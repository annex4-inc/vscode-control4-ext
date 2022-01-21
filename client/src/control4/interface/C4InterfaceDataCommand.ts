
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceParameter from './C4InterfaceParameter';

@jsonObject
export default class C4InterfaceDataCommand {
    @jsonMember
    name: string

    @jsonMember
    type: string

    @jsonArrayMember(C4InterfaceParameter)
    params: C4InterfaceParameter[]
    
    toXml() {
        let node = builder.create("DataCommand").root();

        node.ele("Name", this.name);
        node.ele("Type", this.type);

        let params = node.ele("Params");

        this.params.forEach(p => {
            params.import(p.toXml())
        });
                
        return node;
    }

    static fromXml(obj) : C4InterfaceDataCommand {
      let a = new C4InterfaceDataCommand();
        
      if (obj.params) {
          let params = obj.Params.Param
          let parameters = [];

          if (params[0] == undefined) {
              parameters.push(params)
          } else {
              parameters = params;
          }

          a.params = parameters.map((p) => { return C4InterfaceParameter.fromXml(p) })
      }

      a.name = obj.name;
      a.type = obj.type;
      
      return a
    }
}