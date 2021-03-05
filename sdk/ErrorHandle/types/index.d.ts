export type EventType = 'transaction';

export interface Exception {
  type?: string;
  value?: string;
  mechanism?: Mechanism;
  module?: string;
  thread_id?: number;
  stacktrace?: any;
}

export interface Breadcrumb {
  type?: string;
  event_id?: string;
  category?: string;
  message?: string;
  data?: { [key: string]: any };
  timestamp?: number;
}

export interface Mechanism {
  type: string;
  handled: boolean;
  data?: {
    [key: string]: string | boolean;
  };
  synthetic?: boolean;
}

export interface Request {
  url?: string;
  method?: string;
  data?: any;
  query_string?: string;
  cookies?: { [key: string]: string };
  env?: { [key: string]: string };
  headers?: { [key: string]: string };
}

export interface Stacktrace {
  frames?: StackFrame[];
  frames_omitted?: [number, number];
}


export interface Event {
  event_id?: string;
  message?: string;
  timestamp?: number;
  start_timestamp?: number;
  // level?: Severity;
  platform?: string;
  logger?: string;
  server_name?: string;
  release?: string;
  dist?: string;
  environment?: string;
  request?: Request;
  transaction?: string;
  modules?: { [key: string]: string };
  fingerprint?: string[];
  exception?: {
    values?: Exception[];
  };
  stacktrace?: Stacktrace;
  breadcrumbs?: Breadcrumb[];
  contexts?: {
    [key: string]: object;
  };
  tags?: { [key: string]: string };
  extra?: { [key: string]: any };
  // user?: User;
  type?: EventType;
  // spans?: Span[];
}

/** JSDoc */
export interface Exception {
  type?: string;
  value?: string;
  mechanism?: Mechanism;
  module?: string;
  thread_id?: number;
  // stacktrace?: Stacktrace;
}

export interface StackFrame {
  filename?: string;
  function?: string;
  module?: string;
  platform?: string;
  lineno?: number;
  colno?: number;
  abs_path?: string;
  context_line?: string;
  pre_context?: string[];
  post_context?: string[];
  in_app?: boolean;
  vars?: { [key: string]: any };
}
