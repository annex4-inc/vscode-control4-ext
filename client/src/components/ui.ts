import { TypedJSON } from 'typedjson';
import { C4UI } from '../control4';
import { Component } from './component';

class UIResource extends Component {
    uis: C4UI[]

    constructor() {
        super('ui.c4c');

        this.load().then(() =>
        {
            this.uis = TypedJSON.parseAsArray<C4UI>(this.data, C4UI);
        });
    }

    Get() {
      return this.uis;
    }

    async Reload() {
        await this.load()
        this.uis = TypedJSON.parseAsArray<C4UI>(this.data, C4UI);
        return this.uis
    }
}

const resource = new UIResource();

export default resource;