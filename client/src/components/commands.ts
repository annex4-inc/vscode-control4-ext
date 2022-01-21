import { TypedJSON } from 'typedjson';
import { C4Command } from '../control4';
import { Component } from './component';

class CommandsResource extends Component {
    commands: C4Command[]

    constructor() {
        super('commands.c4c');

        this.load().then(() =>
        {
            this.commands = TypedJSON.parseAsArray<C4Command>(this.data, C4Command);
        });
    }

    Get() {
        return this.commands;
    }

    async Reload() {
        await this.load()
        this.commands = TypedJSON.parseAsArray<C4Command>(this.data, C4Command);
        return this.commands
    }
}

const resource = new CommandsResource();

export default resource;