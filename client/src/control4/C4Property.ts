import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asBoolean } from './utility';

@jsonObject
export class C4Property {
    @jsonMember
    name: string

    @jsonMember
    type: string
    
    @jsonMember({
        deserializer: value => {
            if (typeof(value) == "string") {
                return asBoolean(value)
            } else {
                return value
            }
        }
    }) multiselect?: boolean
    @jsonMember({
        deserializer: value => {
            if (typeof (value) == "string") {
                return Number.parseFloat(value)
            } else {
                return value;
            }
        }
    }) minimum?: number
    @jsonMember({
        deserializer: value => {
            if (typeof (value) == "string") {
                return Number.parseFloat(value)
            } else {
                return value;
            }
        }
    }) maximum?: number
    @jsonMember({
        deserializer: value => {
            return value;
        }
    }) default: string | number
    @jsonMember({
        deserializer: value => {
            if (typeof (value) == "string") {
                return value.toLowerCase() == "true"
            } else {
                return value;
            }
        }
    }) readonly: boolean

    @jsonArrayMember(String)
    items?: string[]

    @jsonMember
    password?: boolean

    toXml() {
        let node = builder.create("property").root();

        for (const key in this) {
            if (key == "items") {
                let items = node.ele("items")

                this.items.forEach((i) => {
                    items.ele("item").txt(i);
                })
            } else {
                //@ts-ignore
                node.ele(key).txt(this[key])
            }
        }

        return node;
    }

    static fromXml(obj): C4Property {
        let a = new C4Property();

        a.name = obj.name;
        a.type = obj.type;
        a.items = obj.items ? obj.items.item : undefined;
        a.multiselect = obj.multiselect != null ? asBoolean(obj.multiselect) : false;
        a.default = typeof (obj.default) == "object" ? "" : obj.default;
        a.maximum = typeof (obj.maximum) == 'string' ? Number.parseInt(obj.maximum) : obj.maximum;
        a.minimum = typeof (obj.minimum) == 'string' ? Number.parseInt(obj.minimum) : obj.minimum;
        a.password = typeof (obj.password) == 'string' ? obj.password.toLowerCase() == "true" : obj.password;
        a.readonly = typeof (obj.readonly) == 'string' ? obj.readonly.toLowerCase() == "true" : obj.readonly;

        return a
    }
}

/*
@jsonObject
export class PropertyType {
    static readonly STRING: string = "STRING";
    static readonly LIST: string = "LIST";
    static readonly RANGED_INTEGER: string = "RANGED_INTEGER";
    static readonly RANGED_FLOAT: string = "RANGED_FLOAT";
    static readonly PASSWORD: string = "PASSWORD";
    static readonly LABEL: string = "LABEL";
    static readonly SCROLL: string = "SCROLL";
    static readonly TRACK: string = "TRACK";
    static readonly DEVICE: string = "DEVICE_SELECTOR";
    static readonly COLOR: string = "COLOR_SELECTOR";
    static readonly DYNAMIC: string = "DYNAMIC_LIST";
    static readonly LINK: string = "LINK";
    static readonly CUSTOM: string = "CUSTOM_SELECT";
}
*/