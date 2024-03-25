import { ifThen, waitState, waitStateNe } from "../generator/condition";
import { always, build, end, getlink, jumpToAfter, links, print, printflush, read, variable, wait, write } from "../generator/core";
import { data } from "../generator/data";
import { DataIO } from "../generator/private/stream";

const bank = build("bank1")
const dataio = new DataIO(bank)

const currentTarget = variable()
const escaping = variable()

dataio.init(() => {
    ifThen(escaping.notEqual(0), () => {
        write(currentTarget, 258, 0x10)
        write(currentTarget, 257, 1)
        write(currentTarget, 256, 1)
        waitState(currentTarget, 256, 0)
        escaping.set(0)
        end()
    })
    dataio.clearScreen("\x00")
    dataio.string("-----Hello -----")
    dataio.string("Say \"Hello World!\" to you.")
    dataio.string("\n>")
    currentTarget.set(null)
    dataio.flush()
})

const [a1, a2, start, len] = dataio.read(() => {
    const vaild = read(currentTarget, 0).get()
    ifThen(vaild.notEqual(0), () => {
        dataio.data(currentTarget, 2, read(currentTarget, 1).get())
        dataio.flush()
    })
    write(currentTarget, 0, 0)
})

ifThen(a1.equal(0x1b), () => {
    const mark = jumpToAfter(escaping.notEqual(0))
    ifThen(a2.equal(0), () => {
        escaping.set(1)
        end()
    })
    ifThen(a2.equal(1), () => { 
        dataio.resetProps()
        dataio.clearScreen("\x00")
        dataio.cursor(0, 0)
        dataio.string("Disconnected. \n>")
        dataio.flush()
        currentTarget.set(0)
        end()
    })
    const a = jumpToAfter(always)
    mark.here()
    escaping.set(0)
    a.here()
})

ifThen(currentTarget.notEqual(0), () => {
    const len = read(bank, 257).get()
    write(currentTarget, 257, len)
    data.copy(bank, 258, currentTarget, 258, len)
    write(currentTarget, 256, 1)
    waitState(currentTarget, 256, 0)
    end()
})

const processed = variable().set(0)
const command = read(bank, start).get()

ifThen(command.equal("C".charCodeAt(0)), () => {
    const index = read(bank, start.toAdd(2)).get().sub(0x30)
    const target = getlink(index).get()
    ifThen(target.equal(0), () => {
        dataio.string("Invaild target.")
    }, () => {
        currentTarget.set(target)
        dataio.string("Connected!\n")
        dataio.string("Press F1 for disconnect.")
        dataio.string("Press ESC for send escape command.")
        dataio.flush()
        wait(0.3)
        dataio.resetProps()
        dataio.clearScreen("\x00")
        dataio.cursor(0, 0)
        dataio.flush()
        write(currentTarget, 258, 0x10)
        write(currentTarget, 257, 1)
        write(currentTarget, 256, 1)
        waitState(currentTarget, 256, 0)
        end()
    })
    processed.set(1)
})
ifThen(command.equal("H".charCodeAt(0)), () => {
    dataio.string("C <index[1-")
    dataio.number(links.toAdd(0x2f))
    dataio.string("]>\n - Connect to a target.\n")
    dataio.string("H\n - Show help message.")
    processed.set(1)
})
ifThen(processed.equal(0), () => {
    dataio.string("Unknown command. Type \"H\" for help.")
})
dataio.string("\n>")
dataio.flush()
