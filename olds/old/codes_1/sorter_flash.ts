import { whileLoop, switchSplit, forLoop, ifThen } from "../generator/condition"
import { variable, build, write, time, control, item, read, sensor, getlink, prop, lookup, printflush, print } from "../generator/core"

const dataEveryPage = variable<number>("dataEveryPage").set(16)
const maxPage = variable("maxPage").set(0)
const dataBinAmount = variable("dataBinAmount").set(8)
const dataBegin = variable("dataBegin").set(8)

/*
0: op code
1: page

3: time
4: dataEveryPage
5: maxPage
6: dataBinAmount
7: dataBegin
*/
const cell = build("cell1")
const status = control(build("sorter1"))
const sorterBegin = variable("sorterBegin").set(2)

write(cell, 3, time)
write(cell, 4, dataEveryPage)
write(cell, 5, maxPage)
write(cell, 6, dataBinAmount)
write(cell, 7, dataBegin)

const opCode = variable("opCode").set(0)
whileLoop(() => opCode.equal(0), () => {
    status.config(item("scrap"))
    read(cell, 0).to(opCode)
    write(cell, 3, time)
})
const page = read(cell, 1).get("page")
const sortersEveryData = dataBinAmount.div(4).ceil()
const sortersEveryPage = dataBinAmount.toMul(dataEveryPage)
const a = sortersEveryData.toSub(1)

switchSplit(opCode.sub(1), [() => {
    status.config(item("titanium"))
    const sorterLinkBegin = dataEveryPage.toMul(page).mul(sortersEveryData).add(sorterBegin)
    const currentNumber = variable().set(0)
    forLoop(()=>variable().set(0), v=>v.lessThan(sortersEveryPage), v=>v.add(1), v => {
        currentNumber.shl(4)
        write(cell, 3, time)
        const config = sensor(getlink(sorterLinkBegin.toAdd(v)).get(), prop("config")).get()
        const i = variable().set(0)
        whileLoop(()=>{
            const item = lookup("item", i).get()
            return item.toOpNotEqual(config).land(item.toOpNotEqual(null)).isTrue()
        }, ()=>{
            i.add(1)
        })
        print(i+" "+config+" ")
        currentNumber.or(i)
        ifThen(v.toMod(sortersEveryData).equal(a), () => {
            printflush(build("message1"))
            write(cell, dataBegin.toAdd(v.toDiv(sortersEveryData).floor()), currentNumber)
            currentNumber.set(0)
        })
    })
    write(cell, 0, 0)
}, () => {
    status.config(item("plastanium"))
    const sorterLinkBegin = dataEveryPage.toMul(page).mul(sortersEveryData).add(sorterBegin)
    const currentNumber = variable().set(0)
    forLoop(()=>variable().set(0), v=>v.lessThan(sortersEveryPage), v=>v.add(1), v => {
        write(cell, 3, time)
        ifThen(v.toMod(sortersEveryData).equal(0), () => {
            read(cell, dataBegin.toAdd(v.toDiv(sortersEveryData).floor())).to(currentNumber)
        })
        const max = v.toDiv(2).floor().add(1).mul(sortersEveryData)
        const index = max.sub(v.toMod(sortersEveryData)).add(sorterLinkBegin).sub(1)
        /*
        i = floor(v / 2) + 1
        j = i * 2 - v
        */
        control(getlink(index).get()).config(lookup("item", currentNumber.toAnd(0xf)).get())
        currentNumber.shr(4)
    })
    write(cell, 0, 0)
}])