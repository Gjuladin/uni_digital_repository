import { HttpClient } from '@angular/common/http';
import { TransferState } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import {
  Observable,
  of,
  throwError,
} from 'rxjs';
import {
  catchError,
  map,
} from 'rxjs/operators';
import JSON5 from 'json5';

import { hasValue } from '../app/shared/empty.util';
import { environment } from '../environments/environment';
import {
  NGX_TRANSLATE_STATE,
  NgxTranslateState,
} from './ngx-translate-state';

/**
 * A TranslateLoader for ngx-translate to retrieve i18n messages from the TransferState, or download
 * them if they're not available there
 */
export class TranslateBrowserLoader implements TranslateLoader {
  constructor(
    protected transferState: TransferState,
    protected http: HttpClient,
    protected prefix?: string,
    protected suffix?: string,
  ) {
  }

  private parseTranslationFile(contents: string, suffix = this.suffix): any {
    return suffix?.endsWith('.json5') ? JSON5.parse(contents) : JSON.parse(contents);
  }

  /**
   * Return the i18n messages for a given language, first try to find them in the TransferState
   * retrieve them using HttpClient if they're not available there
   *
   * @param lang the language code
   */
  getTranslation(lang: string): Observable<any> {
    // Get the ngx-translate messages from the transfer state, to speed up the initial page load
    // client side
    const state = this.transferState.get<NgxTranslateState>(NGX_TRANSLATE_STATE, {});
    const messages = state[lang];
    if (hasValue(messages)) {
      return of(messages);
    } else {
      const translationHash: string = environment.production ? `.${(process.env.languageHashes as any)[lang + '.json5']}` : '';
      const suffix = this.suffix ?? '.json';
      // If they're not available on the transfer state (e.g. when running in dev mode), retrieve
      // them using HttpClient
      return this.http.get(`${this.prefix}${lang}${translationHash}${suffix}`, { responseType: 'text' }).pipe(
        map((fileContents: string) => this.parseTranslationFile(fileContents, suffix)),
        catchError((error) => {
          if (environment.production || suffix.endsWith('.json5')) {
            return throwError(() => error);
          }

          // During local dev, webpack occasionally serves the source .json5 file before the transformed
          // .json asset is available. Fall back so translation keys don't render verbatim in the UI.
          return this.http.get(`${this.prefix}${lang}.json5`, { responseType: 'text' }).pipe(
            map((json5: string) => JSON5.parse(json5)),
          );
        }),
      );
    }
  }
}
