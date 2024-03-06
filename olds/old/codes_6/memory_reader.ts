import { build, getlink, operation, print, printflush, read, variable, write } from "../../../generator/core";
import { waitForLow, waitForHigh, waitCommands } from "../../../generator/private/cpu";

const clock = build("switch1")

const bankBegin = 2

const io = build("cell1")
const addr = 0
const out = 1

const address = variable()
const bank = variable()

const value = variable()

printflush(build("message1"))
waitForLow(clock)
waitForHigh(clock, () => {
    read(io, addr).to(address)
    operation("div", address, 512).to(bank)
    bank.floor()
    address.mod(512)
    getlink(bank.add(bankBegin)).to(bank)
    read(bank, address).to(value)
    read(io, addr).to(address)
    address.mod(512)
})
read(bank, address).to(value)
write(io, out, value)

print(address+" "+value)
printflush(build("message1"))
