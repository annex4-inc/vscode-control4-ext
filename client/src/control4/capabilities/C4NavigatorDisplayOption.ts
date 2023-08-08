
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt } from '../driver';
import { C4DisplayIcons } from './C4DisplayIcons';

export class NavDisplayOptionType {
    static readonly DEFAULT: string = "DEFAULT_ICON";
    static readonly STATE: string = "STATE_ICON";
    static readonly PROXY: string = "PROXY_ID";
    static readonly TRANSLATIONS_URL: string = "TRANSLATIONS_URL";
}

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
            // Can only be one ProxyId so if there are multiple entries only return the first result.
            // TODO - This can certainly be improved to prevent multiple entries or change NavOpt structure in interface.
            let proxyId = options.find(function (p) {
                return p.type === NavDisplayOptionType.PROXY;
            });
            // Can only be one TransURL  so if there are multiple entries only return the first result.
            let transURL = options.find(function (t) {
                return t.type === NavDisplayOptionType.TRANSLATIONS_URL;
            });
            // Uses filter to return all state icons.
            let stateIcos = options.filter(function (s) {
                return s.type === NavDisplayOptionType.STATE;
            });
            //uses filter to return all default icons.
            let defaultIcos = options.filter(function (d) {
                return d.type === NavDisplayOptionType.DEFAULT;
            });

            this.proxybindingid = (typeof proxyId === 'undefined') ? 5001 : proxyId.proxybindingid;
            this.display_icons = new C4DisplayIcons(C4DisplayIcons.fromInterface(defaultIcos, stateIcos));
            this.translation_url = (typeof transURL === 'undefined') ? undefined : transURL.transurl;
            
        }
    }

    toXml() {
        let node = builder.create("navigator_display_option").root();

        node.att("proxybindingid", this.proxybindingid.toString())
        node.import(this.display_icons.toXml())

        if (this.translation_url) {
            node.ele("translation_url").txt(this.translation_url)
        }

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