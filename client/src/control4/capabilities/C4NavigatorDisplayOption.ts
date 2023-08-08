
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt } from '../driver';
import { C4DisplayIcon, DisplayIconType } from './C4DisplayIcon';
import { C4DisplayIcons } from './C4DisplayIcons';

@jsonObject
export class C4NavigatorDisplayOption {
    @jsonMember
    proxybindingid: number

    @jsonMember
    translation_url?: string

    @jsonMember
    display_icons?: C4DisplayIcons

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

            this.display_icons = new C4DisplayIcons(C4DisplayIcons.fromInterface(defaultIcos, stateIcos));
            if (!proxyId) {
                this.proxybindingid = 5001;
            } else {
                this.proxybindingid = proxyId[0].proxybindingid;
            }
            this.translation_url = transURL;
            
            //this.proxybindingid = options.proxybindingid;
            //this.display_icons = new C4DisplayIcons(options.display_icons);
            //this.translation_url = options.translation_url;
        }
    }

    toXml() {
        let node = builder.create("navigator_display_option").root();

        node.att("proxybindingid", this.proxybindingid.toString())
        node.import(this.display_icons.toXml())

        return node;
    }

    static fromXml(value: any): C4NavigatorDisplayOption {
        let option = new C4NavigatorDisplayOption();

        option.proxybindingid = asInt(value["@proxybindingid"])
        option.translation_url = value.translation_url
        option.display_icons = C4DisplayIcons.fromXml(value)

        return option
    }
}