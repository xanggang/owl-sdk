import { Event, Exception, StackFrame } from "../types";
import {
  computeStackTrace,
  StackFrame as TraceKitStackFrame, StackTrace as TraceKitStackTrace
} from "./tracekit";
import { isEvent } from './is'
const STACKTRACE_LIMIT = 50;
const defaultFunctionName = '?'

/**
 * Adds exception mechanism to a given event.
 * @param event The event to modify.
 * @param mechanism Mechanism of the mechanism.
 * @hidden
 */
export function addExceptionMechanism(
  event: Event,
  mechanism: {
    [key: string]: any;
  } = {},
): void {
  // TODO: Use real type with `keyof Mechanism` thingy and maybe make it better?
  try {
    // @ts-ignore
    // tslint:disable:no-non-null-assertion
    event.exception!.values![0].mechanism = event.exception!.values![0].mechanism || {};
    Object.keys(mechanism).forEach(key => {
      // @ts-ignore
      event.exception!.values![0].mechanism[key] = mechanism[key];
    });
  } catch (_oO) {
    // no-empty
  }
}


/**
 * Adds exception values, type and value to an synthetic Exception.
 * @param event The event to modify.
 * @param value Value of the exception.
 * @param type Type of the exception.
 * @hidden
 */
export function addExceptionTypeValue(event: Event, value?: string, type?: string): void {
  event.exception = event.exception || {};
  event.exception.values = event.exception.values || [];
  event.exception.values[0] = event.exception.values[0] || {};
  event.exception.values[0].value = event.exception.values[0].value || value || '';
  event.exception.values[0].type = event.exception.values[0].type || type || 'Error';
}

/**
 * A safe form of location.href
 */
export function getLocationHref(): string {
  try {
    return document.location.href;
  } catch (oO) {
    return '';
  }
}

export function eventFromString(
  input: string,
  syntheticException?: Error,
  options: {
    attachStacktrace?: boolean;
  } = {},
): Event {
  const event: Event = {
    message: input,
  };

  if (options.attachStacktrace && syntheticException) {
    const stacktrace = computeStackTrace(syntheticException);
    const frames = prepareFramesForEvent(stacktrace.stack);
    event.stacktrace = {
      frames,
    };
  }

  return event;
}

export function prepareFramesForEvent(stack: TraceKitStackFrame[]): StackFrame[] {
  if (!stack || !stack.length) {
    return [];
  }

  let localStack = stack;

  const firstFrameFunction = localStack[0].func || '';
  const lastFrameFunction = localStack[localStack.length - 1].func || '';

  // If stack starts with one of our API calls, remove it (starts, meaning it's the top of the stack - aka last call)
  if (firstFrameFunction.indexOf('captureMessage') !== -1 || firstFrameFunction.indexOf('captureException') !== -1) {
    localStack = localStack.slice(1);
  }

  // If stack ends with one of our internal API calls, remove it (ends, meaning it's the bottom of the stack - aka top-most call)
  if (lastFrameFunction.indexOf('sentryWrapped') !== -1) {
    localStack = localStack.slice(0, -1);
  }

  // The frame where the crash happened, should be the last entry in the array
  return localStack
    .slice(0, STACKTRACE_LIMIT)
    .map(
      (frame: TraceKitStackFrame): StackFrame => ({
        colno: frame.column === null ? undefined : frame.column,
        filename: frame.url || localStack[0].url,
        function: frame.func || '?',
        in_app: true,
        lineno: frame.line === null ? undefined : frame.line,
      }),
    )
    .reverse();
}

export function eventFromStacktrace(stacktrace: TraceKitStackTrace): Event {
  const exception = exceptionFromStacktrace(stacktrace);
  exception.stacktrace = exception.stacktrace || {}
  exception.stacktrace.frames = exception.stacktrace.frames || []
  const frames = exception.stacktrace.frames[0] || {}
  const filename = frames.filename
  return {
    exception: {
      values: [exception],
      transaction: filename
    },
  };
}

export function eventFromPlainObject(exception: {}, syntheticException?: Error, rejection?: boolean): Event {
  const event: Event = {
    exception: {
      values: [
        {
          type: isEvent(exception) ? exception.constructor.name : rejection ? 'UnhandledRejection' : 'Error',
          // value: `Non-Error ${
          //   rejection ? 'promise rejection' : 'exception'
          // } captured with keys: ${extractExceptionKeysForMessage(exception)}`,
          value: `Non-Error ${
            rejection ? 'promise rejection' : 'exception'
          } captured with keys: `,
        },
      ],
    },
    extra: {
      // __serialized__: normalizeToSize(exception),
    },
  };

  if (syntheticException) {
    const stacktrace = computeStackTrace(syntheticException);
    const frames = prepareFramesForEvent(stacktrace.stack);
    event.stacktrace = {
      frames,
    };
  }

  return event;
}

export function exceptionFromStacktrace(stacktrace: TraceKitStackTrace): Exception {
  const frames = prepareFramesForEvent(stacktrace.stack);

  const exception: Exception = {
    type: stacktrace.name,
    value: stacktrace.message,
  };

  if (frames && frames.length) {
    exception.stacktrace = { frames };
  }

  // tslint:disable-next-line:strict-type-predicates
  if (exception.type === undefined && exception.value === '') {
    exception.value = 'Unrecoverable error caught';
  }

  return exception;
}

export function getFunctionName(fn: unknown): string {
  try {
    if (!fn || typeof fn !== 'function') {
      return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
  } catch (e) {
    // Just accessing custom props in some Selenium environments
    // can cause a "Permission denied" exception (see raven-js#495).
    return defaultFunctionName;
  }
}

export function truncate(str: string, max: number = 0): string {
  // tslint:disable-next-line:strict-type-predicates
  if (typeof str !== 'string' || max === 0) {
    return str;
  }
  return str.length <= max ? str : `${str.substr(0, max)}...`;
}
