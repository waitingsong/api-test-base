import { setConfig, start } from 'allready'
import { switchMap } from 'rxjs/operators'

import login$ from '../login/index'


export function run() {
  setConfig({ cookies: null })
  const ret$ = login$
    .pipe(
      switchMap(start),
    )
  return ret$
}
