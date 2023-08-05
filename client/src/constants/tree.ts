export class Views {
    public static readonly Actions = "control4-actions";
    public static readonly Connections = "control4-connections";
    public static readonly Properties = "control4-properties";
    public static readonly Events = "control4-events";
    public static readonly Commands = "control4-commands";
    public static readonly UI = "control4-ui";
    public static readonly DisplayIcons = "control4-displayicons";
}

export class Commands {
    public static Actions = {
        Select: "select.C4Action",
        Remove: "remove.C4Action"
    }

    public static Connections = {
        Select: "select.C4Connection",
        Remove: "remove.C4Connection"
    }

    public static Properties = {
        Select: "select.C4Property",
        Remove: "remove.C4Property"
    }

    public static Events = {
        Select: "select.C4Event",
        Remove: "remove.C4Event"
    }

    public static Commands = {
        Select: "select.C4Command",
        Remove: "remove.C4Command"
    }

    public static Parameter = {
        Select: "select.C4Parameter",
        Remove: "remove.C4Parameter"
    }

    public static UI = {
        Select: "select.C4UI",
        Remove: "remove.C4UI"
    }

    public static DisplayIcons = {
        Select: "select.C4DisplayIcon",
        Remove: "remove.C4DisplayIcon"
    }
}