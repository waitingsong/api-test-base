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
  data: Args['data'] | AuthSecret
}

export interface AuthSecret {
  /** user name */
  name: string
  /** user password */
  pwd: string
  [prop: string]: string
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

export interface AjaxResp<T = any> {
  err: number
  /** Sometimes api only return state without err, so generate err by state */
  state: number
  dat?: T
  msg?: string | null
  [key: string]: any
}

/** jqGrid request data */
export interface GridRequest {
  _search?: boolean
  /** Timestamp */
  nd: number
  /** Rows per page */
  rows: number
  /** Page index */
  page: number
  /** Order by field(s) */
  sidx: string
  /** Sort order asc|desc */
  sord: 'asc' | 'desc'
  filters_ext?: GridFilter
}

export interface GridFilter {
  groupOp: 'AND' | 'OR'
  rules: GridFilterRule[]
}

export interface GridFilterRule {
  field: string
  op: GridSearchOper
  data: string
}
/*
  * all: ['eq','ne','lt','le','gt','ge', 'bw','bn','in','ni',
  * 'ew','en','cn','nc']
  * ['equal', 'not equal', 'less', 'less or
  * equal','greater', 'greater or equal', 'begins with', 'does not begin
  * with', 'is in','is not in', 'ends with','does not end
  * with','contains','does not contain']
  */
export type GridSearchOper = 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge' |
  'bw' | 'bn' | 'in' | 'ni' | 'ew' | 'en' | 'cn' | 'nc'


/** jQGrid response data */
export interface GridResp<T = any> {
  /** Current page index */
  page: number
  /** Total items */
  records: number
  /** payload */
  rows: T[] | null
  /** Total pages */
  total: number
}
