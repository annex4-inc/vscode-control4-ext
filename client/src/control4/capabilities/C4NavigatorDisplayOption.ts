import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt } from '../utility';
import { C4DisplayIcons } from './C4DisplayIcons';

@jsonObject
export class C4NavigatorDisplayOption {
    @jsonMember
    proxybindingid: number

    @jsonMember
    translation_url?: string

    @jsonMember
    display_icons?: C4DisplayIcons

    constructor(options?) {
        if (options) {
            this.proxybindingid = options.proxybindingid;
            this.display_icons = new C4DisplayIcons(options.display_icons);
            this.translation_url = options.translation_url;
        }
    }

    toXml() {
        let node = builder.create("navigator_display_option").root();

        node.att("proxybindingid", this.proxybindingid.toString())

        if (this.translation_url) {
            node.ele("translation_url", this.translation_url)
        }
        if (this.display_icons) {
            node.import(this.display_icons.toXml())
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