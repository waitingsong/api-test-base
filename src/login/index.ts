import { setConfig } from 'allready'
import * as assert_ from 'assert'
import { empty, from as ofrom, Observable } from 'rxjs'
import { mapTo, mergeMap, switchMap, take } from 'rxjs/operators'
import { post, RxRequestInit } from 'rxxfetch'
import * as yargs from 'yargs'

import { AuthConfig, AuthOpts, TestConfig } from '../lib/model'
import { loadLoginConfig, parseTestConfig, resolveTestConfigSuitePath, retrieveCookiesFromResp } from '../lib/util'

import { DoLoginRet } from './model'


const assert = assert_
const argv = yargs.argv

let login$: Observable<string> = empty()
let loginName: string | false = 'default'
if (argv.login === false || argv.login === 'false') {
  loginName = false
}

// CLI: `npm run api --login <loginName>`
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
  const { url, data } = options
  const args: RxRequestInit = {
    data,
    dataType: 'raw',
  }

  const ret$ = post<Response>(url, args).pipe(
    mergeMap(resp => {
      assert(resp)
      const cookies = retrieveCookiesFromResp(resp)
      setConfig({ cookies })

      return resp.json().then(res => {
        res.cookies = cookies
        return res
      })
    }),
  )
  return ret$
}


export default login$
