import * as log from '@waiting/log'
import { setConfig, TestResult } from 'allready'
import { reduce, tap } from 'rxjs/operators'

import { initialSummaryCount } from './lib/config'
import { run } from './lib/index'
import { SummaryCount } from './lib/model'
import { outputResult, outputSummary } from './lib/util'


run()
  .pipe(
    tap(outputResult),
    reduce((acc: SummaryCount, curr: TestResult) => {
      acc[curr.status] += 1
      return acc
    }, { ...initialSummaryCount }),
  )
  .subscribe(
    outputSummary,
    err => {
      log.error(err)
      setConfig({ cookies: null })
    },
    () => {
      setConfig({ cookies: null })
    },
  )
