import { type } from 'os';
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { Driver, asInt, asBoolean } from './driver';

export enum Direction {
  Front,
  Back,
  Top,
  Bottom,
  Left,
  Right,
  Unknown
}

export enum Binding {
    Control = 0,
    VideoInput = 1000,
    VideoOutput = 2000,
    AudioInput = 3000,
    AudioOutput = 4000,
    Proxy = 5000,
    Network = 6000,
    Room = 7000,
    Power = 8000
}

export enum ConnectionType {
    Control = 1,
    Proxy,
    AudioVideo,
    Network,
    Video,
    Audio,
    Room
}

@jsonObject
export class C4Port {
    @jsonMember name: string
    @jsonMember number: number
    @jsonMember auto_connect: boolean
    @jsonMember monitor_connection: boolean
    @jsonMember keep_connection: boolean
    @jsonMember keep_alive: boolean
    @jsonMember delimiter: string
    @jsonMember certificate: string
    @jsonMember private_key: string
    @jsonMember cacert: string
    @jsonMember verify_mode: string
    @jsonMember method: string

    toXml() {
        let node = builder.create("port").root();

        for (const key in this) {
            //@ts-ignore
            node.ele(key).txt(this[key])
        }

        return node;
    }

    static fromXml(obj) : C4Port {
        let p = new C4Port();

        p.name = obj.name
        p.number = asInt(obj.number)
        p.auto_connect = asBoolean(obj.auto_connect)
        p.monitor_connection = asBoolean(obj.monitor_connection)
        p.keep_connection = asBoolean(obj.keep_connection)
        p.keep_alive = asBoolean(obj.keep_alive)
        p.delimiter = obj.delimeter
        p.certificate = obj.certificate
        p.private_key = obj.private_key
        p.cacert = obj.cacert
        p.verify_mode = obj.verify_mode
        p.method = obj.method

        return p;
    }
}

@jsonObject
export class C4ConnectionClass {
    @jsonMember classname: string
    @jsonMember autobind: boolean
    @jsonArrayMember(C4Port) ports?: C4Port[]

    toXml() {
        let node = builder.create("class").root();

        for (const key in this) {
            if (key == "ports") {
                let ports = node.ele("ports")

                this.ports.forEach(p => {
                    ports.import(p.toXml())
                });
            } else {
                //@ts-ignore
                node.ele(key).txt(this[key])
            }
        }

        return node;
    }

    static fromXml(obj) : C4ConnectionClass {
        let c = new C4ConnectionClass()

        c.autobind = obj.autobind;
        c.classname = obj.classname;
        
        if (obj.ports) {
            let ports = Driver.CleanXmlArray(obj.ports, "port")

            c.ports = ports.map((e) : C4Port => {
                return C4Port.fromXml(e)
            })
        }

        return c
    }
}

@jsonObject 
export class C4Connection {
    @jsonMember id: number
    @jsonMember connectionname: string
    @jsonMember facing: Direction
    @jsonMember type: number
    @jsonMember consumer: boolean
    @jsonMember linelevel: boolean
    @jsonMember idautobind: number
    @jsonMember audiosource: boolean
    @jsonMember videosource: boolean
    @jsonMember proxybindingid: number
    @jsonMember hidden: boolean
    @jsonArrayMember(C4ConnectionClass) classes: C4ConnectionClass[]
    @jsonMember autobind: boolean
    @jsonMember nobindingkey: string
    @jsonMember total?: number

    toXml() {
        let node = builder.create("connection").root();

        for (const key in this) {
            if (key == "classes") {
                let classes = node.ele("classes")

                this.classes.forEach(c => {
                    classes.import(c.toXml())
                });
            } else {
                //@ts-ignore
                node.ele(key).txt(this[key])
            }
        }

        return node;
    }

    static fromXml(obj) : C4Connection {
        let c = new C4Connection();

        c.connectionname = obj.connectionname
        c.proxybindingid = typeof(obj['@proxybindingid']) == "string" ? Number.parseInt(obj['@proxybindingid']) : obj['@proxybindingid']
        c.type = typeof(obj.type) == "string" ? Number.parseInt(obj.type) : obj.type
        c.audiosource = obj.audiosource ? obj.audiosource.toLowerCase() == "true" : obj.audiosource
        c.videosource = obj.videosource ? obj.videosource.toLowerCase() == "true" : obj.videosource
        c.autobind = obj.autobind ? obj.autobind.toLowerCase() == "true" : obj.autobind
        c.consumer = obj.consumer ? obj.consumer.toLowerCase() == "true" : obj.consumer
        c.facing = typeof(obj.facing) == "string" ? Number.parseInt(obj.facing) : obj.facing
        c.hidden = obj.hidden ? obj.hidden.toLowerCase() == "true" : obj.hidden
        c.id = typeof(obj.id) == "string" ? Number.parseInt(obj.id) : obj.id
        c.idautobind = typeof(obj.idautobind) == "string" ? Number.parseInt(obj.idautobind) : obj.idautobind

        if (obj.classes)
        {
            let classes = Driver.CleanXmlArray(obj.classes, "class")

            c.classes = classes.map((e) : C4ConnectionClass => {
                return C4ConnectionClass.fromXml(e)
            })
        }
        return c
    }
}

@jsonObject
export class C4NetworkConnection extends C4Connection {
    @jsonMember auto_connect: boolean
    @jsonMember monitor_connection: boolean
    @jsonMember keep_connection: boolean
    @jsonMember delimiter: string
    @jsonMember grow: number
}