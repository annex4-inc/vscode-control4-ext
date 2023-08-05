import { TypedJSON } from 'typedjson';
import { C4DisplayIcon } from '../control4';
import { Component } from './component';

class DisplayIconsResource extends Component {
    displayicons: C4DisplayIcon[]

    constructor() {
        super('displayicons.c4c');

        this.load().then(() =>
        {
            this.displayicons = TypedJSON.parseAsArray<C4DisplayIcon>(this.data, C4DisplayIcon);
        });
    }

    Get() {
        return this.displayicons;
    }

    async Reload() {
        await this.load()
        this.displayicons = TypedJSON.parseAsArray<C4DisplayIcon>(this.data, C4DisplayIcon);
        return this.displayicons
    }
}

const resource = new DisplayIconsResource();

export default resource;