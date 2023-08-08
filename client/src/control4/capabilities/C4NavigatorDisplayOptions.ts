
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt, Driver } from '../driver';
import { C4DisplayIcon, DisplayIconType } from './C4DisplayIcon';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';
import C4StateIcon from './C4StateIcon';
import { C4DisplayIcons } from './C4DisplayIcons';
import { C4State } from '../C4State';

@jsonObject
export class C4NavigatorDisplayOptions {
    @jsonMember
    proxybindingid: number

    @jsonMember
    translation_url?: string

    @jsonMember
    driver_filename?: string

    @jsonMember
    icon_path_template?: string

    @jsonMember
    translation_url_template?: string

    @jsonArrayMember(C4DisplayIcon)
    default_icons?: C4DisplayIcon[]

    @jsonArrayMember(C4DisplayIcon)
    state_icons?: C4DisplayIcon[]

    @jsonMember(C4InterfaceIcon)
    states?: {[key:string]: C4InterfaceIcon[]}

    constructor(options?, driverfilename?) {
        if (options) {
            let proxyId = options.find(function (p) {
                return p.type === DisplayIconType.PROXY;
            });
            let transURL = options.find(function (t) {
                return t.type === DisplayIconType.TRANSLATIONS_URL;
            });
            let stateIcos = options.filter(function (s) {
                return s.type === DisplayIconType.STATE;
            });
            let defaultIcos = options.filter(function (d) {
                return d.type === DisplayIconType.DEFAULT;
            });

            let dispIcons = C4DisplayIcons.fromInterface(defaultIcos, stateIcos);

            this.proxybindingid = 5001;
            //this.proxybindingid = proxyId.proxybindingid || 5001;
            this.default_icons = defaultIcos;
            this.state_icons = stateIcos;
            this.driver_filename = driverfilename || "";
            this.icon_path_template = "controller://driver/%DRIVERFILENAME%/%RELPATH%/%ICONFILENAME%%SIZE%.png".replace(/%DRIVERFILENAME%/gi, this.driver_filename);
            this.translation_url = transURL;
            this.translation_url_template = "controller://driver/%DRIVERFILENAME%/%RELPATH%";
        }
    }

    toXml() {
        let node = builder.create("navigator_display_option").root();

        node.att("proxybindingid", this.proxybindingid.toString())

        if (!this.default_icons && !this.state_icons) {
            return node
        } 

        let displayicons = node.ele("display_icons");

        if (this.default_icons) {
            this.default_icons.forEach((i: C4DisplayIcon) => {
                i.sizes.forEach((size) => {
                    let iconPath = this.icon_path_template.replace(/%RELPATH%/gi, i.relpath || "icons/device").replace(/%ICONFILENAME%/gi, i.id).replace(/%SIZE%/gi, '_' + size)
                    displayicons.ele("Icon", {
                        height: size,
                        width: size
                    }).txt(iconPath);
                })
            })
        }

        if (this.state_icons) {
            this.state_icons.forEach((i: C4DisplayIcon) => {
                displayicons.import(i.toXml(this.icon_path_template));
            })  
        }

        return node;
    }

    static fromXml(value: any): C4NavigatorDisplayOptions {
        let option = new C4NavigatorDisplayOptions();

        option.proxybindingid = asInt(value["@proxybindingid"])
        option.translation_url = value.translation_url

        //let displayicons = value.display_icons

       // if (displayicons) {
            //option.display_icons = C4DisplayIcons.fromXml(displayicons)
       // }

        return option
    }
}