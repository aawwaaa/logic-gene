import { forLoop, ifNot } from "../generator/condition";
import {
  build,
  control,
  end,
  getlink,
  item,
  prop,
  sensor,
  variable,
} from "../generator/core";

const lastEnable = variable();
const enable = sensor(build("door1"), prop("enabled")).get();

ifNot(enable.notEqual(0), () => {
  ifNot(lastEnable.equal(0), () => {
    forLoop(
      () => variable().set(5),
      (v) => v.lessThan(5 + 8),
      (v) => v.add(1),
      (v) => {
        const target = getlink(v).get();
        control(target).enabled(0);
      },
    );
  });
  lastEnable.set(0);
  end();
});
lastEnable.set(1);

const addr = sensor(build("door2"), prop("enabled"))
  .get()
  .shl(3)
  .or(sensor(build("door3"), prop("enabled")).get().shl(2))
  .or(sensor(build("door4"), prop("enabled")).get().shl(1))
  .or(sensor(build("door5"), prop("enabled")).get());

addr.mul(8).add(1 + 4 + 8);

forLoop(
  () => variable().set(5),
  (v) => v.lessThan(5 + 8),
  (v) => v.add(1),
  (v) => {
    const sorter = getlink(addr).get();
    const config = sensor(sorter, prop("config")).get();
    const target = getlink(v).get();
    control(target).enabled(config.opNotEqual(item("coal")));
    addr.add(1);
  },
);
