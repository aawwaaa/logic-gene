import { doWhileLoop, forLoop, ifNot, ifThen, init } from "../generator/condition";
import { Building, Value, build, end, getlink, read, variable, write } from "../generator/core";

const io = build("bank1")
const id = variable().set(0)
const db = getlink(id.toAdd(1)).get()

const nameSetted = variable()

init(()=>{
    write(db, 0, 0)
})

ifNot(read(io, 256).get().isTrue(), ()=>{
    ifNot(nameSetted.isTrue(), end)
    forLoop(()=>variable().set(0), v=>v.lessThan(6), v=>v.add(1), v=>{
        const has = read(db, v.toAdd(32)).get()
        ifThen(has.isTrue(), ()=>{
            const cell = getlink(v.toAdd(1)).get()
            send("\n")
            sendData(cell, 65, read(cell, 64).get())
            send("\n>")
            write(db, v.toAdd(32), 0)
        })
    })
    end()
})

const len = read(io, 257).get()
const c1 = read(io, 258).get()
const c2 = read(io, 259).get()

const contentStart = variable().set(259)
const contentLen = len.toSub(1)

write(io, 256, 0)

ifThen(c1.equal(0x05), ()=>{
    contentStart.add(1)
    contentLen.sub(1)
}, ()=>ifThen(c1.equal(0x1b), ()=>{
    contentStart.add(1)
    contentLen.sub(1)
}))

function send(str: string){
    let p = 2;
    write(io, 1, str.length);
    for(const c of str){
        write(io, p++, c.charCodeAt(0))
    }
    write(io, 0, 1)
    const i = variable()
    doWhileLoop(i.notEqual(0), ()=>read(io, 0).to(i))
}

function sendData(cell: Value<Building>, start: Value<number>, length: Value<number>){
    const p = variable().set(2)
    write(io, 1, length)
    forLoop(()=>variable().set(0), v=>v.lessThan(length), v=>v.add(1), v=>{
        const data = read(cell, v.toAdd(start)).get()
        write(io, p, data)
        p.add(1)
    })
    write(io, 0, 1)
    const i = variable()
    doWhileLoop(i.notEqual(0), ()=>read(io, 0).to(i))
}

ifThen(c1.equal(0x06), ()=>{
    const onlines = variable().set(0)
    forLoop(()=>variable().set(1), v=>v.lessThan(variable("@links")), v=>v.add(1), v=>{
        const n = read(getlink(v).get(), 0).get()
        ifNot(n.equal(0), ()=>onlines.add(1))
    })
    send("---chat server---\nthere are ".toUpperCase())
    write(io, 1, 1);
    write(io, 2, onlines.toAdd(0x30));
    write(io, 0, 1);
    const i = variable()
    doWhileLoop(i.notEqual(0), ()=>read(io, 0).to(i))
    send(" onlines.".toUpperCase())
    send("\npress ctrl+h for help.".toUpperCase())
    send("\nplease enter your name.\n>".toUpperCase())
    nameSetted.set(false)
    write(db, 0, 0)
})

ifThen(c1.equal(0x0a), ()=>{
    ifThen(nameSetted.isFalse(), ()=>{
        const p = variable().set(1)
        write(db, 0, contentLen)
        forLoop(()=>variable().set(0), v=>v.lessThan(contentLen), v=>v.add(1), v=>{
            const data = read(io, v.toAdd(contentStart)).get()
            write(db, p, data)
            p.add(1)
        })
        nameSetted.set(true)
        send("name: ".toUpperCase())
        sendData(io, contentStart, contentLen)
        send("\n>".toUpperCase())
    }, ()=>{
        const p = variable().set(65)
        const nameLen = read(db, 0).get()
        write(db, 64, contentLen.toAdd(nameLen).add(1))
        forLoop(()=>variable().set(0), v=>v.lessThan(nameLen), v=>v.add(1), v=>{
            const data = read(db, v.toAdd(1)).get()
            write(db, p, data)
            p.add(1)
        })
        write(db, p, ":".charCodeAt(0))
        p.add(1)
        forLoop(()=>variable().set(0), v=>v.lessThan(contentLen), v=>v.add(1), v=>{
            const data = read(io, v.toAdd(contentStart)).get()
            write(db, p, data)
            p.add(1)
        })
        forLoop(()=>variable().set(1), v=>v.lessThan(variable("@links")), v=>v.add(1), v=>{
            ifNot(v.equal(id.toAdd(1)), ()=>write(getlink(v).get(), id.toAdd(32), 1))
        })
        send("\n>".toUpperCase())
    })
})

ifThen(c1.equal(0x05), ()=>{
    ifThen(c2.equal('o'.charCodeAt(0)), ()=>{
        const onlines = variable().set(0)
        forLoop(()=>variable().set(1), v=>v.lessThan(variable("@links")), v=>v.add(1), v=>{
            const n = read(getlink(v).get(), 0).get()
            ifNot(n.equal(0), ()=>onlines.add(1))
        })
        send("\n---".toUpperCase())
        write(io, 1, 1);
        write(io, 2, onlines.toAdd(0x30));
        write(io, 0, 1);
        const i = variable()
        doWhileLoop(i.notEqual(0), ()=>read(io, 0).to(i))
        send(" onlines---".toUpperCase())
        forLoop(()=>variable().set(1), v=>v.lessThan(variable("@links")), v=>v.add(1), v=>{
            const cell = getlink(v).get()
            const n = read(getlink(v).get(), 0).get()
            ifThen(n.notEqual(0), ()=>{
                send("\n")
                sendData(cell, 1, n)
            })
        })
        send("\n>")
    })
    ifThen(c2.equal('n'.charCodeAt(0)), ()=>{
        send("please enter your new name.\n>".toUpperCase())
        nameSetted.set(false)
        write(db, 0, 0)
    })
    ifThen(c2.equal('h'.charCodeAt(0)), ()=>{
        send("ctrl+o onlines\nctrl+n change name\n>".toUpperCase())
    })
})