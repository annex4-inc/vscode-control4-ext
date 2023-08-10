import { TypedJSON } from 'typedjson';
import { C4NavDisplayOption } from '../control4';
import { Component } from './component';

class NavDisplayOptionsResource extends Component {
    navdisplayoptions: C4NavDisplayOption[]

    constructor() {
        super('navdisplayoptions.c4c');

        this.load().then(() =>
        {
            this.navdisplayoptions = TypedJSON.parseAsArray<C4NavDisplayOption>(this.data, C4NavDisplayOption);
        });
    }

    Get() {
        return this.navdisplayoptions;
    }

    async Reload() {
        await this.load()
        this.navdisplayoptions = TypedJSON.parseAsArray<C4NavDisplayOption>(this.data, C4NavDisplayOption);
        return this.navdisplayoptions
    }
}

const resource = new NavDisplayOptionsResource();

export default resource;