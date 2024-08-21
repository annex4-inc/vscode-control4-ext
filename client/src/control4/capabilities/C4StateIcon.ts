import 'reflect-metadata';
import { jsonArrayMember, jsonMember } from 'typedjson';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';
import { C4PathTemplates } from './C4NavigatorDisplayOption';
import { cleanXmlArray } from '../utility';

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

        let icons = cleanXmlArray(value, "Icon")

        i.Icons = icons.map((d) => {
            return C4InterfaceIcon.fromXml(d)
        })

        return i;
    }

    static fromInterface(value: any, path: string = C4PathTemplates.C4ROOT_PATH + C4PathTemplates.ICON_PATH) : C4StateIcon {
        let i = new C4StateIcon();

        i.Id = value.iconstate

        path = path.replace(/%RELPATH%/gi, value.relpath || "icons/device").replace(/%ICONFILENAME%/gi, value.id);

        i.Icons = new Array( new C4InterfaceIcon( {path: path, sizes: value.sizes} ))

        return i;
    }

}