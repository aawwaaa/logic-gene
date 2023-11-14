import { forLoop } from "../generator/condition";
import { build, print, printflush, read, variable } from "../generator/core";

const cell = build("cell1")
forLoop(()=>variable().set(0), v=>v.lessThan(16), v=>v.add(1), v=>{
    print(read(cell, v).get()+"\n")
})
printflush(build("message1"))