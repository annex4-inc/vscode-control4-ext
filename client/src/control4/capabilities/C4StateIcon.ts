
import 'reflect-metadata';
import { jsonArrayMember, jsonMember } from 'typedjson';
import { Driver } from '../driver';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';

export default class C4StateIcon {
    @jsonMember
    Id: string

    @jsonArrayMember(C4InterfaceIcon)
    Icons: C4InterfaceIcon[]

    constructor(options?) {
        if (options) {
            this.Id = options.Id;
            this.Icons = options.Icons;
        }
    }

    static fromXml(value: any) : C4StateIcon {
        let i = new C4StateIcon();

        i.Id = value["@id"]

        let icons = Driver.CleanXmlArray(value, "Icon")

        i.Icons = icons.map((d) => {
            return C4InterfaceIcon.fromXml(d)
        })

        return i;
    }
}