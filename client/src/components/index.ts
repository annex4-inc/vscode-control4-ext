import { C4Property, C4Action, C4Command, C4Connection, C4Event, C4Proxy, C4UI } from '../control4';
import { Component } from './component';

export const ActionsResource     = new Component<C4Action>('actions.c4c', C4Action);
export const CommandsResource    = new Component<C4Command>('commands.c4c', C4Command);
export const ConnectionsResource = new Component<C4Connection>('connections.c4c', C4Connection);
export const EventsResource      = new Component<C4Event>('events.c4c', C4Event);
export const PropertiesResource  = new Component<C4Property>('properties.c4c', C4Property);
export const ProxiesResource     = new Component<C4Proxy>('proxies.c4c', C4Proxy);
export const UIResource          = new Component<C4UI>('ui.c4c', C4UI);