import { ifThen, switchSplit } from "../generator/condition";
import { build, print, printflush, variable } from "../generator/core";
import { DataIO } from "../generator/private/streaming";

const io = build("bank1")

const dataio = new DataIO(io)

const selects = [
    "processor",
    "link",
    "is",
    "faster",
    "than",
    "conveyor"
]

const currentSelect = variable()

dataio.init(()=>{
    currentSelect.set(0)
    dataio.ustring(" ---TESTING---- ")
    selects.forEach((a, i)=>{
        dataio.cursor(i+3, 1)
        dataio.ustring(a)
        if(i == 0){
            dataio.cursor(i+3, 0)
            dataio.char(">")
        }
    })
    dataio.cursor(15, 0)
    dataio.ustring("[^V]move [En]ok")
    dataio.flush()
})

const [c1, c2, cbegin, clen] = dataio.read()

print(c1+" "+c2)
printflush(build("message1"))

ifThen(c1.equal(0x0a), ()=>{
    switchSplit(currentSelect, selects.map(a=>()=>{
        dataio.cursor(13, 0)
        for(let i = 0; i < 16; i++) dataio.number(0)
        dataio.cursor(13, 1)
        dataio.ustring(a)
        dataio.flush()
    }))
})

ifThen(c1.equal(0x1b), ()=>{
    ifThen(c2.equal(17), ()=>{
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.char('\x00')
        currentSelect.add(selects.length - 1)
        currentSelect.mod(selects.length)
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.char('>')
        dataio.flush()
    })
    ifThen(c2.equal(18), ()=>{
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.char('\x00')
        currentSelect.add(1)
        currentSelect.mod(selects.length)
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.char('>')
        dataio.flush()
    })
})