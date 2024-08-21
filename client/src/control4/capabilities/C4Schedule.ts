
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { cleanXmlArray } from '../utility';

export class C4ScheduleEntry {
    @jsonMember
    Name: string

    @jsonMember
    Time: number

    @jsonMember
    Enabled: boolean

    @jsonMember
    Heat: number

    @jsonMember
    Cool: number

    constructor(options?) {
        if (options) {
            this.Name = options.Name;
            this.Time = options.Time;
            this.Enabled = options.Enabled;
            this.Heat = options.Heat;
            this.Cool = options.Cool;
        }
    }

    static fromXml(value: any) : C4ScheduleEntry {
        let e = new C4ScheduleEntry();

        e.Name = value["@Name"]
        e.Time = value["@Time"]
        e.Enabled = value["@Enabled"].toLowerCase() == "true"
        e.Heat = value["@Heat"]
        e.Cool = value["@Cool"]

        return e;
    }
}

@jsonObject
export class C4ScheduleDayInfo {
    @jsonArrayMember(C4ScheduleEntry)
    Entries: C4ScheduleEntry[]

    @jsonMember
    DefaultHeat: number

    @jsonMember
    DefaultCool: number

    constructor(options?) {
        if (options) {
            this.DefaultCool = options.DefaultCool
            this.DefaultHeat = options.DefaultHeat
            this.Entries = options.Entries.map((e) => {
                return new C4ScheduleEntry(e);
            })
        }
    }

    static fromXml(value: any) : C4ScheduleDayInfo {
        let s = new C4ScheduleDayInfo();

        s.DefaultCool = value["@DefaultCool"]
        s.DefaultHeat = value["@DefaultHeat"]
        s.Entries = cleanXmlArray(value.schedule_entry, "schedule_entry").map((e) => {
            return C4ScheduleEntry.fromXml(e);
        })

        return s;
    }
}

@jsonObject
export class C4Schedule {
    @jsonMember
    schedule_day_info: C4ScheduleDayInfo

    constructor(options?) {
        if (options) {
            this.schedule_day_info = new C4ScheduleDayInfo(options.schedule_day_info)
        }
    }

    toXml() {
        let node = builder.create("schedule_default").root();

        let info = node.ele("schedule_day_info");

        info.att("Entries", this.schedule_day_info.Entries.length.toString())
        info.att("DefaultHeat", this.schedule_day_info.DefaultHeat.toString())
        info.att("DefaultCool", this.schedule_day_info.DefaultCool.toString())

        for (let i = 0; i < this.schedule_day_info.Entries.length; i++) {
            let e = this.schedule_day_info.Entries[i];

            let se = info.ele("schedule_entry")
                .att("Name", e.Name)
                .att("Time", e.Time.toString())
                .att("Enabled", e.Enabled ? "true" : "false")
                .att("Heat", e.Heat.toString())
                .att("Cool", e.Cool.toString())
        }

        return node;
    }

    static fromXml(value: any): C4Schedule {
        let option = new C4Schedule();

        option.schedule_day_info = C4ScheduleDayInfo.fromXml(value);

        return option;
    }
}