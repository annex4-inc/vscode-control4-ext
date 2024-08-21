local VERSION = "Driver Version"

local ID_MASTER = 1
local ID_OUTPUT_START = 2
local ID_OUTPUT_END   = 11

function ReceivedFromSerial(idBinding, data)
    if (idBinding == ID_MASTER) then
        for index = ID_OUTPUT_START, ID_OUTPUT_END, 1 do
            C4:SendToProxy(index, "SERIAL_DATA", C4:Base64Encode(data), "NOTIFY")
        end
    end
end

function ReceivedFromProxy(idBinding, strCommand, tParams)
    if (strCommand == "SEND") then
        C4:SendToSerial(ID_MASTER, C4:Base64Decode(tParams.data))
    end
end

function OnDriverLateInit()
    C4:UpdateProperty(VERSION, C4:GetDriverConfigInfo("semver"))
end