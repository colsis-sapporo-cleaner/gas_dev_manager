import {onOpen, updateInstances, startInstance, stopInstance, scheduleStart, scheduleStop} from "./main";

declare const global: {
  [x: string]: unknown;
};

global.onOpen = onOpen;
global.updateInstances = updateInstances;
global.startInstance = startInstance;
global.stopInstance = stopInstance;
global.scheduleStart = scheduleStart;
global.scheduleStop = scheduleStop;
