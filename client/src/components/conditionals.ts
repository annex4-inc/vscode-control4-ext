import { TypedJSON } from 'typedjson';
import { C4Conditional } from '../control4';
import { Component } from './component';

class ConditonalsResource extends Component {
    actions: C4Conditional[]

    constructor() {
        super('actions.c4c');

        this.load().then(() =>
        {
            this.actions = TypedJSON.parseAsArray<C4Conditional>(this.data, C4Conditional);
        });
    }

    Get() {
        return this.actions;
    }

    async Reload() {
        await this.load()
        this.actions = TypedJSON.parseAsArray<C4Conditional>(this.data, C4Conditional);
        return this.actions
    }
}

const resource = new ConditonalsResource();

export default resource;