import { TypedJSON } from 'typedjson';
import { Component } from './component';
import { C4Event } from '../control4/C4Event';

class EventsResource extends Component {
    events: C4Event[]

    constructor() {
        super('events.c4c');

        this.load().then(() =>
        {
            this.events = TypedJSON.parseAsArray(this.data, C4Event);
        });
    }

    Get() : C4Event[] {
        return this.events
    }

    async Reload() {
        await this.load()
        this.events = TypedJSON.parseAsArray<C4Event>(this.data, C4Event);
        return this.events
    }
}

const resource = new EventsResource();

export default resource;