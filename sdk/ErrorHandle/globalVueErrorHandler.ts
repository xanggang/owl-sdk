import {eventFromStacktrace} from "./util/utils";
import {computeStackTrace} from "./util/tracekit";

const ANONYMOUS_COMPONENT_NAME = 'anonymous component'
const ROOT_COMPONENT_NAME = 'root'

function getComponentName(vm: any): string {
  // Such level of granularity is most likely not necessary, but better safe than sorry. — Kamil
  if (!vm) {
    return ANONYMOUS_COMPONENT_NAME;
  }

  if (vm.$root === vm) {
    return ROOT_COMPONENT_NAME;
  }

  if (!vm.$options) {
    return ANONYMOUS_COMPONENT_NAME;
  }

  if (vm.$options.name) {
    return vm.$options.name;
  }

  if (vm.$options._componentTag) {
    return vm.$options._componentTag;
  }

  return ANONYMOUS_COMPONENT_NAME;
}

export default function (err: any, vm: any) {
  const event = eventFromStacktrace(computeStackTrace(err as Error));

  return {
    ...event,
    vueData: {
      componentName: getComponentName(vm),
      propsData: vm.$options.propsData
    }
  }
}

