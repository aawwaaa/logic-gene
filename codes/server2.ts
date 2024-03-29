import { build, print, printflush } from "../generator/core";
import { DataIO } from "../generator/private/stream";

const dataio = new DataIO(build("bank1"))
dataio.init(() => {
    dataio.stringflush("Hello world!")
})

const [a1, a2, start, len] = dataio.read()
print(a1 + " " + a2)
printflush(build("message1"))
