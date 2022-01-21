-- Load stubs
dofile("node_modules/@annex4/test.control4/src.lua")

-- Include NPM dependencies
dofile('tests/generated.lua')

-- Load test module
require('busted')

-- Load driver
require('driver')

local inspect = require 'inspect'

describe("Driver", function()
  it("loads", function()
    local start1, result1 = pcall(_G["OnDriverLateInit"])
    local start2, result2 = pcall(_G["OnDriverInit"])

    if (not start1) then
        assert.are.equal(true, start2)
        return
    end

    assert.are.equal(true, start1)
  end)
end)
