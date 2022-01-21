import { TypedJSON } from 'typedjson';
import { C4Action } from '../control4';
import { Component } from './component';

class ActionsResource extends Component {
    actions: C4Action[]

    constructor() {
        super('actions.c4c');

        this.load().then(() =>
        {
            this.actions = TypedJSON.parseAsArray<C4Action>(this.data, C4Action);
        });
    }

    Get() {
        return this.actions;
    }

    async Reload() {
        await this.load()
        this.actions = TypedJSON.parseAsArray<C4Action>(this.data, C4Action);
        return this.actions
    }
}

const resource = new ActionsResource();

export default resource;