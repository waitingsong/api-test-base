import { LogSymbol, SummaryCount, TestConfig } from './model'


export const initialTestConfig: TestConfig = {
  cookies: null,
  suitePath: '/',
  urlPrefix: '',
  TLS_REJECT_UNAUTHORIZED: '0',
}

const isWin32 = process.platform === 'win32' ? true : false
export const logSymbol: LogSymbol = {
  succeed: isWin32 ? '\u221A' : '✓',
  failed: isWin32 ? '\u00D7' : '✖',
  skipped: '-',
  unknown: '?',
}

export const initialSummaryCount: SummaryCount = {
  succeed: 0,
  failed: 0,
  skipped: 0,
  unknown: 0,
}
