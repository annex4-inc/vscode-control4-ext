export const Parameter_Map = {
    //"LIST": "", // Handled by the Enumerate function
    "STRING": "string",
    "RANGED_INTEGER": "number",
    "RANGED_FLOAT": "number",
    "PASSWORD": "string",
    "LABEL": "string",
    "SCROLL": "number",
    "TRACK": "number",
    "DEVICE": "string[]",
    "COLOR": "string",
    "DYNAMIC": "string",
    "LINK": "string",
    "CUSTOM": "string",
}

export const Enumerate = (name: string, values: any[]) => {
    let e = [`---@alias ${CleanName(name)}`]

    values.forEach((v) => {
        e.push(`---| "${v}"`)
    })

    e.push("")

    return e;
}

export const CleanName = (name: string) => {
    return name.replace(/ /g, "").replace(/-/g, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .replace(/\)/g, "")
    .replace(/\(/g, "")
}