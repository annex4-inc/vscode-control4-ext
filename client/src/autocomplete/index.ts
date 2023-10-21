import ActionsResource from '../components/actions';
import CommandsResource from '../components/commands';
import ConnectionsResource from '../components/connections';
import EventsResource from '../components/events';
import PropertiesResource from '../components/properties';
import ProxiesResource from '../components/proxies';
import { C4Action } from '../control4/C4Action';

ActionsResource.emitter.on("changed", (items: C4Action[]) => {
    // TODO: Update a typings folder for hooks.onAction(<action>, <action_params>)
})