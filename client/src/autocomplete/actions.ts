import path from 'path';
import { ActionsResource } from '../components';
import { C4Action } from '../control4/C4Action';
import { ForceWrite } from '../utility';
import vscode from 'vscode';
import { Parameter_Map, Enumerate, CleanName } from './_shared';

ActionsResource.emitter.on("changed", async (items: C4Action[]) => {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    let lines = ["---@meta", "", "---@class Hooks"];

    items.forEach((action) => {
        lines.push(`---@field onAction fun(action: "${CleanName(action.command)}", cb: fun(tParams: Action.Params.${CleanName(action.command)}))`)
    })

    items.forEach((action) => {
        lines.push(`\r\n---@class Action.Params.${CleanName(action.command)}`)
        if (action.params) {
            action.params.forEach((param) => {
                lines.push(`---@field ${param.name} ${Parameter_Map[param.type] || param.name + "Param"}`)
            })

            lines.push("")
            
            action.params.forEach((param) => {
                if (param.type === "LIST") {
                    lines.push(...Enumerate(`${param.name}Param`, param.items))
                }
            })
        }        
    })

    let result = await ForceWrite(path.join(workspacePath, "generated", "actions.type.lua"), lines.join("\r\n"));
})