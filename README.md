## Installing

Using npm:

```bash
$ npm install owl-util-sdk
```

Using yarn:

```bash
$ yarn add owl-util-sdk
```

## use
```javascript
import LogSdkVue from 'owl-util-sdk/dist/plugins/vue'

const sdk = new LogSdkVue({
  apiKey: '111',
  uploadHost: `${process.env.VUE_APP_API_HOST}/api/logs/store`,
  errorWhiteList: []
})

Vue.use(sdk)

Vue.prototype.$emitCustomizeError = sdk.emitCustomizeError.bind(sdk)
```

>apiKey前往`http://owl-web.lynn.cool/`注册获取， 用作项目的key
>uploadHost`http://owl.lynn.cool`

## 管理后台
> http://owl-web.lynn.cool

