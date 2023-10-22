import path from 'path';
import ActionsResource from '../components/actions';
import CommandsResource from '../components/commands';
import ConnectionsResource from '../components/connections';
import EventsResource from '../components/events';
import PropertiesResource from '../components/properties';
import ProxiesResource from '../components/proxies';
import { C4Action } from '../control4/C4Action';
import { WriteFileContents } from '../utility';
import vscode from 'vscode';

ActionsResource.emitter.on("changed", async (items: C4Action[]) => {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.path;

    let lines = ["---@meta", "", "---@class Hooks"];

    items.forEach((action) => {
        lines.push(`---@class Action.Params.${action.command}`)
    })

    items.forEach((action) => {
        lines.push(`---@field onAction fun(action: "${action.command}" cb: fun(tParams: Action.Params.${action.command}))`)
    })

    let result = await WriteFileContents(path.join(workspacePath, "generated", "actions.type.lua"), lines.join("\r\n"));
    // TODO: Update a typings folder for hooks.onAction(<action>, <action_params>)
})