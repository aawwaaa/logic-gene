import { doWhileLoop, forLoop, ifNot, ifThen, whileLoop } from "../generator/condition";
import { build, sensor, prop, control, read, time, end, item, variable, Var, Value, write } from "../generator/core";

const loadButton = build("switch1")
const saveButton = build("switch2")
const ioCell = build("cell1")
const indexCell = build("cell2")
const dataBank = build("bank1")
const status = control(build("sorter1"))

ifNot(read(ioCell, 3).get().add(1000).greaterThan(time), () => {
    status.config(item("blast-compound"))
    end()
})
status.config(item("scrap"))
const dataEveryPage = read(ioCell, 4).get()
const maxPage = read(ioCell, 5).get()
const dataBegin = read(ioCell, 7).get()
const currentPage = variable("currentPage").set(0)
const currentData = variable("currentData").set(0)
function writeData(data: Value<number>){
    write(ioCell, dataBegin.toAdd(currentData), data)
    currentData.add(1)
    ifThen(currentData.greaterThanEq(dataEveryPage), writeflush)
}
function writeflush(){
    write(ioCell, 1, currentPage)
    write(ioCell, 0, 2)
    whileLoop(() => read(ioCell, 0).get().notEqual(0), ()=>{
        status.config(item("carbide"))
    })
    currentPage.add(1)
    ifThen(currentPage.greaterThan(maxPage), ()=>{
        control(saveButton).enabled(false)
        control(loadButton).enabled(false)
        end()
    })
    currentData.set(0)
    status.config(item("spore-pod"))
    forLoop(()=>variable().set(0), v=>v.lessThan(dataEveryPage), v=>v.add(1), v=>{
        write(ioCell, dataBegin.toAdd(v), 0)
    })
    status.config(item("plastanium"))
}
function readData(to: Var<number>){
    read(ioCell, dataBegin.toAdd(currentData)).to(to)
    currentData.add(1)
    ifThen(currentData.greaterThanEq(dataEveryPage), readflush)
}
function readflush(){
    ifThen(currentPage.greaterThan(maxPage), ()=>{
        control(saveButton).enabled(false)
        control(loadButton).enabled(false)
        end()
    })
    write(ioCell, 1, currentPage)
    write(ioCell, 0, 1)
    whileLoop(() => read(ioCell, 0).get().notEqual(0), ()=>{
        status.config(item("beryllium"))
    })
    status.config(item("titanium"))
    currentPage.add(1)
    currentData.set(0)
}

ifThen(sensor(loadButton, prop("enabled")).get().isTrue(), ()=>{
    readflush()
    const data = variable<number>().set(0)
    readData(data)
    write(indexCell, 63, data)
    const localDataIndex = variable().set(0)
    doWhileLoop(()=>data.notEqual(0), ()=>{
        readData(data)
        write(dataBank, localDataIndex, data)
        localDataIndex.add(1)
    })
    control(loadButton).enabled(false)
})
ifThen(sensor(saveButton, prop("enabled")).get().isTrue(), ()=>{
    status.config(item("spore-pod"))
    forLoop(()=>variable().set(0), v=>v.lessThan(dataEveryPage), v=>v.add(1), v=>{
        write(ioCell, dataBegin.toAdd(v), 0)
    })
    const data = variable<number>().set(0)
    read(indexCell, 63).to(data)
    writeData(data)
    const localDataIndex = variable().set(0)
    doWhileLoop(()=>data.notEqual(0), ()=>{
        read(dataBank, localDataIndex).to(data)
        writeData(data)
        localDataIndex.add(1)
    })
    writeflush()
    control(saveButton).enabled(false)
})