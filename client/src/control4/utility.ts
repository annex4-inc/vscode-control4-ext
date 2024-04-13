export const asInt = function (v: string) {
    return typeof (v) == "string" ? Number.parseInt(v) : v
}

export const asBoolean = function (v: string): boolean {
    return typeof (v) == "string" ? v.toLowerCase() == "true" : v
}

export const cleanXmlArray = function(object, expectedTag): Array<any> {
    let root = object;

    if (Object.keys(root).length === 0) {
        return null;
    }

    if (!Array.isArray(object)) {
        if (object['#']) {
            root = object['#']
        }

        if (object[expectedTag]) {
            root = object[expectedTag]
        }
    }

    let ret = [];

    if (Array.isArray(root)) {
        for (let i = 0; i < root.length; i++) {
            let element = root[i];

            if (element[expectedTag]) {
                if (Array.isArray(element[expectedTag])) {
                    for (let j = 0; j < element[expectedTag].length; j++) {
                        ret.push(element[expectedTag][j])
                    }
                } else {
                    ret.push(element[expectedTag])
                }
            } else if (element["!"] == undefined) {
                ret.push(element)
            }
        }
    } else {
        ret.push(root)
    }

    return ret;
}