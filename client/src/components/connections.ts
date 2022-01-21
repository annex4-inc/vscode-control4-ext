import { TypedJSON } from 'typedjson';
import { C4Connection } from '../control4';
import { Component } from './component';

class ConnectionsResource extends Component {
    connections: C4Connection[]

    constructor() {
        super('connections.c4c');

        this.load().then(() =>
        {
            this.connections = TypedJSON.parseAsArray<C4Connection>(this.data, C4Connection);
        });
    }

    Get() {
        return this.connections;
    }

    async Reload() {
        await this.load()
        this.connections = TypedJSON.parseAsArray<C4Connection>(this.data, C4Connection);
        return this.connections
    }
}

const resource = new ConnectionsResource();

export default resource;