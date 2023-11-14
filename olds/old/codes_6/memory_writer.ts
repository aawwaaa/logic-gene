import { ifNot } from "../../../generator/condition";
import { build, end, getlink, operation, read, variable, write } from "../../../generator/core";
import { waitForLow, waitForHigh } from "../../../generator/private/cpu";

const clock = build("switch1")

const bankBegin = 2

const io = build("cell1")
const addr = 0
const enabled = 2
const dataIn = 3

const address = variable()
const bank = variable()

waitForHigh(clock, () => {
    read(io, addr).to(address)
    operation("div", address, 512).to(bank)
    bank.floor()
    getlink(bank.add(bankBegin)).to(bank)
    address.mod(512)
})

ifNot(read(io, enabled).get().notEqual(0), end)

const data = read(io, dataIn).get()

waitForLow(clock)

write(bank, address, data)