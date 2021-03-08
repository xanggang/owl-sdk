
import {
  addExceptionMechanism,
  addExceptionTypeValue, eventFromPlainObject,
  eventFromStacktrace,
  eventFromString,
} from './util/utils';
import {isDOMError, isDOMException, isError, isErrorEvent, isEvent, isPlainObject, isPrimitive} from './util/is'
import { Event } from './types';
import {computeStackTrace} from './util/tracekit';

export default function callback(e: any) {
  let error = e;
  // dig the object of the rejection out of known event types
  try {
    // PromiseRejectionEvents store the object of the rejection under 'reason'
    // see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
    if ('reason' in e) {
      error = e.reason;
    }
    // something, somewhere, (likely a browser extension) effectively casts PromiseRejectionEvents
    // to CustomEvents, moving the `promise` and `reason` attributes of the PRE into
    // the CustomEvent's `detail` attribute, since they're not part of CustomEvent's spec
    // see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent and
    // https://github.com/getsentry/sentry-javascript/issues/2380
    else if ('detail' in e && 'reason' in e.detail) {
      error = e.detail.reason;
    }
  } catch (e) {
    // no-empty
  }

  const event = isPrimitive(error)
    ? _eventFromIncompleteRejection(error)
    : eventFromUnknownInput(error, undefined, {
      attachStacktrace: false,
      rejection: true,
    });

  addExceptionMechanism(event, {
    handled: false,
    type: 'onunhandledrejection',
  });

  return event;
}

function _eventFromIncompleteRejection(error: any): Event {
  return {
    exception: {
      values: [
        {
          type: 'UnhandledRejection',
          value: `Non-Error promise rejection captured with value: ${error}`,
        },
      ],
    },
  };
}

function eventFromUnknownInput(
  exception: unknown,
  syntheticException?: Error,
  options: {
    rejection?: boolean;
    attachStacktrace?: boolean;
  } = {},
): Event {
  let event: Event;
  // 如果是错误事件， 则提取事件的错误对象， 格式化
  if (isErrorEvent(exception as ErrorEvent) && (exception as ErrorEvent).error) {
    // If it is an ErrorEvent with `error` property, extract it to get actual Error
    const errorEvent = exception as ErrorEvent;
    exception = errorEvent.error; // tslint:disable-line:no-parameter-reassignment
    event = eventFromStacktrace(computeStackTrace(exception as Error));
    return event;
  }
  // 老版本的api， 为了兼容
  if (isDOMError(exception as DOMError) || isDOMException(exception as DOMException)) {
    // If it is a DOMError or DOMException (which are legacy APIs, but still supported in some browsers)
    // then we just extract the name and message, as they don't provide anything else
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
    const domException = exception as DOMException;
    const name = domException.name || (isDOMError(domException) ? 'DOMError' : 'DOMException');
    const message = domException.message ? `${name}: ${domException.message}` : name;

    event = eventFromString(message, syntheticException, options);
    addExceptionTypeValue(event, message);
    return event;
  }
  // 标准的错误对象
  if (isError(exception as Error)) {
    // we have a real Error object, do nothing
    event = eventFromStacktrace(computeStackTrace(exception as Error));
    return event;
  }
  if (isPlainObject(exception) || isEvent(exception)) {
    // If it is plain Object or Event, serialize it manually and extract options
    // This will allow us to group events based on top-level keys
    // which is much better than creating new group when any key/value change
    const objectException = exception as Record<string, unknown>
    event = eventFromPlainObject(objectException, syntheticException, options.rejection);
    addExceptionMechanism(event, {
      synthetic: true,
    });
    return event;
  }

  // If none of previous checks were valid, then it means that it's not:
  // - an instance of DOMError
  // - an instance of DOMException
  // - an instance of Event
  // - an instance of Error
  // - a valid ErrorEvent (one with an error property)
  // - a plain Object
  //
  // So bail out and capture it as a simple message:
  event = eventFromString(exception as string, syntheticException, options);
  addExceptionTypeValue(event, `${exception}`, undefined);
  addExceptionMechanism(event, {
    synthetic: true,
  });

  return event;
}
