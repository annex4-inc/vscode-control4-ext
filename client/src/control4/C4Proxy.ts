import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt, asBoolean } from './utility';

export enum C4ImageSource {
    Driver = "c4z",
    URL = "url"
}

export enum C4ProxyType {
    Television = "tv",
    Cable = "cable",
    Amplifier = "amplifier",
    Receiver = "receiver",
    Tuner = "tuner",
    TunerXM = "tunerXM",
    MediaPlayer = "media_player",
    MediaService = "media_service",
    Light = "light_v2",
    Camera = "camera",
    DVD = "dvd",
    Thermostat = "thermostat",
    UIButton = "uibutton",
    Blind = "blind",
    SecurityPanel = "securitypanel",
    Security = "security",
    ContactSwitch = "contactsingle_contactswitch_c4",
    DiscChanger = "discchanger",
    Pool = "pool"
}

export enum C4ProxyClass {
    Television = "TV",
    Cable = "SATELLITE",
    Amplifier = "AMPLIFIER",
    Receiver = "RECEIVER",
    Tuner = "TUNER",
    TunerXM = "TUNERXM",
    MediaPlayer = "MEDIA_PLAYER",
    MediaService = "MediaService",
    Light = "LIGHT_V2",
    Camera = "CAMERA",
    DVD = "DVD",
    Thermostat = "THERMOSTAT",
    UIButton = "UIBUTTON",
    Blind = "BLIND",
    SecurityPanel = "SECURITY_PANEL",
    Security = "SECURITY",
    Pool = "Pool"
}

@jsonObject
export class C4Proxy {
    @jsonMember id: number
    @jsonMember name: string
    @jsonMember small_image: string
    @jsonMember large_image: string
    @jsonMember primary: boolean
    @jsonMember image_source: C4ImageSource
    @jsonMember proxy: C4ProxyType

    toXml() {
        let node = builder.create();

        let e = node.ele("proxy");

        e.att({
            proxybindingid: this.id,
            name: this.name,
            small_image: this.small_image,
            large_image: this.large_image,
            image_source: this.image_source
        })

        e.txt(this.proxy)

        return node;
    }

    static fromXml(obj): C4Proxy {
        let p = new C4Proxy()

        p.id = asInt(obj["@proxybindingid"]) // Proxy binding id
        p.image_source = obj["@image_source"]
        p.large_image = obj["@large_image"]
        p.small_image = obj["@small_image"]
        p.name = obj["@name"]
        p.primary = asBoolean(obj["@primary"])
        p.proxy = obj["#"]

        return p
    }

    static GetClassName(proxy: C4ProxyType) {
        return "Test!"
    }
}