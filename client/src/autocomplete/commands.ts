import path from 'path';
import CommandsResource from '../components/commands';
import { C4Command } from '../control4/C4Command';
import { ForceWrite } from '../utility';
import vscode from 'vscode';
import { Parameter_Map, Enumerate, CleanName } from './_shared';

CommandsResource.emitter.on("changed", async (items: C4Command[]) => {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    let lines = ["---@meta", "", "---@class Hooks"];

    items.forEach((command) => {
        lines.push(`---@field onCommand fun(command: "${command.name}", cb: fun(tParams: Command.Params.${CleanName(command.name)}))`)
    })

    items.forEach((command) => {
        lines.push("")
        lines.push(`---@class Command.Params.${CleanName(command.name)}`)
        if (command.params) {
            command.params.forEach((param) => {
                let name = `${CleanName(command.name)+CleanName(param.name)}Param`
                lines.push(`---@field ${CleanName(param.name)} ${Parameter_Map[param.type] || name}`)
            })

            lines.push("")
            
            command.params.forEach((param) => {
                if (param.type === "LIST") {
                    let name = `${CleanName(command.name)+CleanName(param.name)}Param`
                    lines.push(...Enumerate(name, param.items))
                }
            })
        }        
    })

    let result = await ForceWrite(path.join(workspacePath, "generated", "commands.type.lua"), lines.join("\r\n"));
})