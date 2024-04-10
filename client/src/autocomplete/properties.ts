import path from 'path';
import PropertiesResource from '../components/properties';
import { C4Property } from '../control4/C4Property';
import { ForceWrite } from '../utility';
import vscode from 'vscode';
import { Parameter_Map, Enumerate, CleanName } from './_shared';

PropertiesResource.emitter.on("changed", async (items: C4Property[]) => {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    let lines = ["---@meta", "", "---@class Hooks"];

    items.forEach((property) => {
        if (property.type === 'LIST') {
            lines.push(`---@field onProperty fun(property: "${property.name}", cb: fun(value: Property.Value.${CleanName(property.name)}))`)
        } else {
            lines.push(`---@field onProperty fun(property: "${property.name}", cb: fun(value: ${Parameter_Map[property.type] || "any"}))`)
        }
    })

    lines.push("")

    items.forEach((property) => {
        if (property.type === "LIST") { 
            lines.push(...Enumerate(`Property.Value.${CleanName(property.name)}`, property.items))
        }    
    })

    let result = await ForceWrite(path.join(workspacePath, "generated", "properties.type.lua"), lines.join("\r\n"));
})