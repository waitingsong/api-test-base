import { RetStatus } from 'allready'
import { Args } from 'rxxfetch'


export interface TestConfig {
  /** May set by login callback retrieved from response headers */
  cookies: Args['cookies'] | null
  /**
   * Relative path or path array of TestSuite, base on `<appRoot>/src/api/`
   * Defalut: <appRoot>/src/api/
   */
  suitePath: string | string[]
  /** global request url prefix */
  urlPrefix: string

  /**
   * process.env.NODE_TLS_REJECT_UNAUTHORIZED
   * Default:'0'
   */
  TLS_REJECT_UNAUTHORIZED: string
}

export interface AuthConfig {
  login: AuthOpts
  [key: string]: AuthOpts
}

export interface AuthOpts {
  /** Full URL of auth request */
  url: string
  /** Secret auth info to be send */
  data: Args['data']
}

/** Export type of src/login/config.<loginName>.ts */
export interface LoginConfig {
  /** Auth config. optional */
  authConfig?: AuthConfig
  testConfig: TestConfig
}


export type RetStatusKey = keyof typeof RetStatus

export type LogSymbol = {
  [status in RetStatusKey]: string
}


/** Summary count of each RetStatus */
export type SummaryCount = {
  [status in RetStatusKey]: number
}
