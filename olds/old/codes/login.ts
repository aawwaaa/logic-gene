import { ifNot } from "../generator/condition";
import { build, end, read, write } from "../generator/core";

const io = build("bank1")
const db = build("bank2")

ifNot(read(io, 128).get().isTrue(), end)

write(io, 128, 0)
write(io, 129, 0)