import { ifNot, ifThen, switchSplit, waitState } from "../generator/condition";
import { build, print, printflush, read, variable, write } from "../generator/core";
import { data } from "../generator/data";
import { DataIO } from "../generator/private/streaming";

const io = build("bank1")
const mem = build("bank2")
const auth = build("bank3")

const dataio = new DataIO(io)

const sid = variable()

dataio.init(()=>{
    sid.set(-1)
    dataio.ustringflush("username: ")
    var [c1, c2, cbegin, clen] = dataio.read()
    write(mem, 0, clen)
    data.copy(io, cbegin, mem, 1, clen)
    dataio.ustringflush("password: ")
    var [c1, c2, cbegin, clen] = dataio.read()
    dataio.ustringflush("please wait\n")
    const ulen = read(mem, 0).get()
    write(auth, 0, ulen)
    data.copy(mem, 1, auth, 1, ulen)
    write(auth, 64, clen)
    data.copy(io, cbegin, auth, 65, clen)
    write(auth, 128, 1)
    waitState(auth, 128, 0)
    const succ = read(auth, 129).get()
    read(auth, 130).to(sid)
    ifNot(succ.notEqual(0), ()=>{
        dataio.ustringflush("success.")
    })
    ifNot(succ.notEqual(1), ()=>{
        dataio.ustringflush("access denied.")
    })
    ifNot(succ.notEqual(2), ()=>{
        dataio.ustringflush("user not exists.")
    })
})

const [c1, c2, cbegin, clen] = dataio.read()

