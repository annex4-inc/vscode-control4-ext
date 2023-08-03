
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt, Driver } from '../driver';
import { C4ExperienceIcon } from '../C4ExperienceIcon';

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

    @jsonArrayMember(C4ExperienceIcon)
    default_icons?: C4ExperienceIcon[]

    @jsonArrayMember(C4ExperienceIcon)
    state_icons?: C4ExperienceIcon[]

    constructor(options?, driverfilename?) {
        if (options) {
            let proxyId = options.find(function (ei) {
                return ei.type === 'PROXY_ID';
            });
            let transURL = options.find(function (tu) {
                return tu.type === 'TRANSLATION_URL';
            });
            let stateIcos = options.filter(function (states) {
                return states.type === 'State_Icon';
            });
            let defaultIcos = options.filter(function (dflt) {
                return dflt.type === 'Default_Icon';
            });
            this.proxybindingid = proxyId || 5001;
            this.translation_url = transURL;
            this.default_icons = defaultIcos;
            this.state_icons = stateIcos;
            this.driver_filename = driverfilename || "";
            this.icon_path_template = "controller://driver/%DRIVERFILENAME%/%RELPATH%/%ICONFILENAME%%SIZE%.png".replace(/%DRIVERFILENAME%/gi, this.driver_filename);
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
            this.default_icons.forEach((i: C4ExperienceIcon) => {
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
            this.state_icons.forEach((i: C4ExperienceIcon) => {
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