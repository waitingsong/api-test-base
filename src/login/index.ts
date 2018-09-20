import { setConfig } from 'allready'
import { empty, from as ofrom, Observable } from 'rxjs'
import { map, mapTo, mergeMap, pluck, switchMap, take } from 'rxjs/operators'
import { post, JsonType, RxRequestInit } from 'rxxfetch'
import * as yargs from 'yargs'

import { AjaxResp, AuthConfig, AuthOpts, TestConfig } from '../lib/model'
import {
  loadLoginConfig,
  parseTestConfig,
  resolveTestConfigSuitePath,
  retrieveAuthInfoFromArgv,
  retrieveCookiesFromResp,
} from '../lib/util'
import { assert } from '../shared/index'

import { DoLoginRet } from './model'


const argv = yargs.argv
// CLI: `npm run api -- --name username --pwd 123456`
const authSecret = retrieveAuthInfoFromArgv(argv)

let login$: Observable<string> = empty()
let loginName: string | false = 'default'
if (argv.login === false || argv.login === 'false') {
  loginName = false
}

// CLI: `npm run api -- --login <loginName>`
if (loginName) {
  const mod = loadLoginConfig(loginName)
  const testConfig: TestConfig = parseTestConfig(<TestConfig> mod.testConfig)
  const authConfig: AuthConfig | void = mod.authConfig

  const { suitePath, urlPrefix, TLS_REJECT_UNAUTHORIZED } = testConfig
  urlPrefix && setConfig({ urlPrefix })
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = TLS_REJECT_UNAUTHORIZED

  login$ = ofrom(suitePath)
  if (authConfig) {
    login$ = combineAuth(authConfig).pipe(
      switchMap(() => ofrom(suitePath)),
    )
  }
}
else {
  const path = argv.path ? argv.path : '/'
  const suitePath = resolveTestConfigSuitePath(path)
  login$ = ofrom(suitePath)
}


if (typeof argv.TLS_REJECT_UNAUTHORIZED !== 'undefined') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = argv.TLS_REJECT_UNAUTHORIZED + ''
}


function combineAuth(config: AuthConfig): Observable<void> {
  const ret$ = doLogin(config.login).pipe(
    take(1),
    mapTo(void 0),
  )

  return ret$
}


function doLogin(options: AuthOpts): Observable<DoLoginRet> {
  const url = options.url
  const data = <JsonType> options.data
  if (authSecret.name) {
    data.userCode = authSecret.name
  }
  if (authSecret.pwd) {
    data.userPassword = authSecret.pwd
  }
  const args: RxRequestInit = {
    data,
    dataType: 'raw',
  }

  const ret$ = post<Response>(url, args).pipe(
    mergeMap(resp => {
      const cookies = retrieveCookiesFromResp(resp)
      setConfig({ cookies })

      const stream$ = ofrom(resp.json()).pipe(
        map((res: AjaxResp<DoLoginRet>) => {
          if (typeof res.err !== 'undefined') {
            assert(!res.err, res.msg ? res.msg : 'empty result.msg')
          }
          else if (typeof res.state !== 'undefined') {
            assert(+res.state > 5, res.msg ? res.msg : 'empty result.msg')
          }

          if (typeof res.dat === 'object' && res.dat) {
            res.dat.cookies = cookies ? cookies : null
          }
          else {
            res.dat = { cookies: cookies ? cookies : null }
          }

          return res
        }),
      )
      return stream$
    }),
    pluck<JsonType, DoLoginRet>('dat'),
  )
  return ret$
}


export default login$
