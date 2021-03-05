
export function isPrimitive(wat: any): boolean {
  return wat === null || (typeof wat !== 'object' && typeof wat !== 'function');
}
export function isErrorEvent(wat: any): boolean {
  return Object.prototype.toString.call(wat) === '[object ErrorEvent]';
}

export function isString(wat: any): boolean {
  return Object.prototype.toString.call(wat) === '[object String]';
}

export function isDOMError(wat: any): boolean {
  return Object.prototype.toString.call(wat) === '[object DOMError]';
}

export function isDOMException(wat: any): boolean {
  return Object.prototype.toString.call(wat) === '[object DOMException]';
}

export function isError(wat: any): boolean {
  switch (Object.prototype.toString.call(wat)) {
    case '[object Error]':
      return true;
    case '[object Exception]':
      return true;
    case '[object DOMException]':
      return true;
    default:
      return isInstanceOf(wat, Error);
  }
}

export function isEvent(wat: any): boolean {
  // tslint:disable-next-line:strict-type-predicates
  return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
}

export function isPlainObject(wat: any): boolean {
  return Object.prototype.toString.call(wat) === '[object Object]';
}

export function isInstanceOf(wat: any, base: any): boolean {
  try {
    // tslint:disable-next-line:no-unsafe-any
    return wat instanceof base;
  } catch (_e) {
    return false;
  }
}
