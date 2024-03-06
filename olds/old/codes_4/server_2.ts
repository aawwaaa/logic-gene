import { doWhileLoop, forLoop, ifNot, ifThen, init } from "../generator/condition";
import { Building, Value, build, end, print, printflush, read, variable, write } from "../generator/core";
import { copyData, stringConstantDynamic } from "../generator/data";
import { DataIO } from "../generator/private/streaming";

const io = build("bank1")

const dataio = new DataIO(io)

dataio.init(()=>{
    dataio.ustring("hello!\n>")
    dataio.flush()
})

const [c1, c2, contentStart, contentLength] = dataio.read()

ifThen(c1.equal(0x0a), ()=>{
    dataio.ustring("these is you typed: ")
    dataio.data(io, contentStart, contentLength)
    dataio.ustring("\n>")
    dataio.flush()
})