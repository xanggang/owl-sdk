declare module 'ua-device'
declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'window' {
  const LogSdkVue: any;
  const LogSdk: any;
}
