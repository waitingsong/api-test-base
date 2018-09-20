import { error, log } from '@waiting/log'
import { TestResult } from 'allready'
import { parseRespCookie } from 'rxxfetch'
import { Arguments as YargsArg } from 'yargs'

import { basename, join } from '../shared/index'

import { initialTestConfig, logSymbol } from './config'
import { AuthSecret, LoginConfig, RetStatusKey, SummaryCount, TestConfig } from './model'


export function retrieveAuthInfoFromArgv(argv: YargsArg): AuthSecret {
  const ret: AuthSecret = {
    name: argv.name ? String(argv.name) : '',
    pwd: argv.pwd ? String(argv.pwd) : '',
  }
  return ret
}


/**
 * Loading auth config from src/login/config.{configName}.
 * Default:"default"
 */
export function loadLoginConfig(configName: string = 'default'): LoginConfig {
  const path = join(__dirname, `../login/config.${configName}`)
  const mod = require(path)
  return mod
}


/** Retrieve cookies from response headers as object */
export function retrieveCookiesFromResp(resp: Response) {
  const cookies = resp.headers.get('Set-Cookie')
  return parseRespCookie(cookies)
}


/** Resolve testConfig from login/config.env.ts */
export function parseTestConfig(config: Partial<TestConfig>): TestConfig {
  const ret: TestConfig = { ...initialTestConfig, ...config }

  if (ret.urlPrefix) {
    ret.urlPrefix = ret.urlPrefix.trim()
  }

  ret.suitePath = resolveTestConfigSuitePath(ret.suitePath)

  return ret
}


/** Resolve relative suite path or path array with absolute path */
export function resolveTestConfigSuitePath(ps?: string | string[]): string[] {
  const baseDir = join(__dirname, '../api/')

  if (! ps) {
    return [baseDir]
  }

  if (typeof ps === 'string') {
    const path = join(baseDir, ps.trim())
    return [path]
  }

  if (Array.isArray(ps)) {
    const ret = ps.map(value => value && value.trim() ? join(baseDir, value.trim()) : '')
      .filter(path => path.length > 0)
    return ret
  }

  throw new TypeError('Value of param of resolveTestConfigSuitePath() invalid')
}


export function outputResult(data: TestResult): void {
  log(`\n${logSymbol[data.status]} ${ basename(data.filePath) } ${data.suiteName}`)
  if (data.error) {
    error(data.error.name + '-------------------')
    error(data.error.message)
    data.error.stack && error(data.error.stack)
    log('----------------------')
  }
}


export function outputSummary(summary: SummaryCount): void {
  log('\n\n--------- Summary Count ---------')
  for (const [key, value] of Object.entries(summary)) {
    const sym = logSymbol[<RetStatusKey> key]
    log(`${sym} ${key}: ${value}`)
  }
  log('---------------------------------\n')
}
