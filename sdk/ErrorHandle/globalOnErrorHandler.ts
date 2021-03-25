import  {
  isPrimitive,
  isErrorEvent,
  isString,
  isDOMError,
  isDOMException,
  isError, isEvent,
  isPlainObject
} from './util/is'
import { Event } from './types';
import {
  addExceptionMechanism,
  addExceptionTypeValue,
  getLocationHref,
  eventFromString,
  eventFromStacktrace,
  eventFromPlainObject
} from './util/utils'

import { computeStackTrace } from './util/tracekit'

function _eventFromIncompleteOnError(msg: any, url: any, line: any, column: any): Event {
  const ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;

  // If 'message' is ErrorEvent, get real message from inside
  // 如果是错误事件， 则取msg， 否则直接展示
  let message = isErrorEvent(msg) ? msg.message : msg;
  let name;

  if (isString(message)) {
    const groups = message.match(ERROR_TYPES_RE);
    if (groups) {
      name = groups[1];
      message = groups[2];
    }
  }

  const event = {
    exception: {
      values: [
        {
          type: name || 'Error',
          value: message,
        },
      ],
    },
  };

  return _enhanceEventWithInitialFrame(event, url, line, column);
}

function _enhanceEventWithInitialFrame(event: Event, url: any, line: any, column: any): Event {
  event.exception = event.exception || {};
  event.exception.values = event.exception.values || [];
  event.exception.values[0] = event.exception.values[0] || {};
  event.exception.values[0].stacktrace = event.exception.values[0].stacktrace || {};
  event.exception.values[0].stacktrace.frames = event.exception.values[0].stacktrace.frames || [];
  const length = event.exception.values[0].stacktrace.frames.length
  const lastFrames =  event.exception.values[0].stacktrace.frames[length - 1] || {}
  event.exception.transaction = lastFrames.filename

  const colno = isNaN(parseInt(column, 10)) ? undefined : column;
  const lineno = isNaN(parseInt(line, 10)) ? undefined : line;
  const filename = isString(url) && url.length > 0 ? url : getLocationHref();

  if (event.exception.values[0].stacktrace.frames.length === 0) {
    event.exception.values[0].stacktrace.frames.push({
      colno,
      filename,
      function: '?',
      in_app: true,
      lineno,
    });
  }

  return event;
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
    const objectException = exception as Record<string, unknown>;
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

export default function(data: any ): any {
  const { msg, url, line, column, error } = data
  const event = isPrimitive(error) // 非error类型的错误
    ? _eventFromIncompleteOnError(msg, url, line, column)
    : _enhanceEventWithInitialFrame(
      eventFromUnknownInput(error, undefined, {
        rejection: false,
      }),
      url,
      line,
      column,
    );

  addExceptionMechanism(event, {
    handled: false,
    type: 'onerror',
  });
  return event
}
