
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceTrait from './C4InterfaceTrait';

@jsonObject
export default class C4InterfaceList {
    @jsonMember
    defaultAction: string

    @jsonMember
    titleProperty: string
    
    @jsonMember
    subtitleProperty: string

    @jsonMember
    imageProperty: string

    @jsonMember
    iconProperty: string

    @jsonMember
    lengthProperty: string

    @jsonMember
    isLink: C4InterfaceTrait

    toXml() {
        let node = builder.create("Param").root();

        node.ele("DefaultAction", this.defaultAction);
        node.ele("TitleProperty", this.titleProperty);
        node.ele("SubTitleProperty", this.subtitleProperty);
        node.ele("ImageProperty", this.imageProperty);
        node.ele("IconProperty", this.iconProperty);
        node.ele("LengthProperty", this.lengthProperty);
                
        return node;
    }

    static fromXml(obj) : C4InterfaceList {
      let i = new C4InterfaceList()
  
      i.defaultAction = obj["DefaultAction"]
      i.titleProperty = obj["TitleProperty"]
      i.subtitleProperty = obj["SubTitleProperty"];      
      i.imageProperty = obj["ImageProperty"];
      i.iconProperty = obj["IconProperty"];
      i.lengthProperty = obj["LengthProperty"];
  
      return i
    }
}