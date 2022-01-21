
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceIcon from "./C4InterfaceIcon"

@jsonObject
export default class C4InterfaceIcons {
  @jsonMember
  id: string

  @jsonArrayMember(Number)
  sizes: number[]

  @jsonMember
  template: string

  @jsonArrayMember(C4InterfaceIcon)
  icons?: C4InterfaceIcon[]

  toXml() {
    let node = builder.create("Icons").root();

    for (const key in this) {
      if (key == "icons") {
        let icons = node.ele("IconGroup");

        this.icons.forEach(i => {
          icons.import(i.toXml())
        });
      } else {
        //@ts-ignore
        node.ele(key).txt(this[key]);
      }
    }

    return node;
  }

  static fromXml(obj): C4InterfaceIcons {
    let icons = new C4InterfaceIcons();

    icons.id = obj["@id"]
    icons.icons = obj.Icons.map(function(i) {
      return C4InterfaceIcon.fromXml(i);
    })

    return icons;
  }
}