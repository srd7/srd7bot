import Inject              from "app/lib/di/Inject";
import Cache               from "app/lib/external/Cache";

import PNCAccessKeys       from "app/model/PNCAccessKeys";

const CACHE_PREFIX = "PNCMyPage-accessKey-";

const CACHE_LIMIT = 86400000; // キャッシュの生存時間 = 24時間

@Inject({ cache: Cache, pncAccessKeys: PNCAccessKeys })
export default class PNCAccessKeyHelper {
  static injectionName = "PNCAccessKeyHelper";
  constructor({ cache, pncAccessKeys }) {
    this.cache         = cache;
    this.pncAccessKeys = pncAccessKeys;
  }

  confirmAccessKey(accessKey) {
    const cacheKey = CACHE_PREFIX + accessKey;
    return this.cache.get(cacheKey)
      .then(data => {
        if (data) {
          return JSON.parse(data);
        } else {
          return this.pncAccessKeys.findByAccessKey(accessKey)
            .then(data => {
              if (! data) {
                return {};
              } else {
                const value = {
                  twitterId  : data.twitterId,
                  botActionId: data.botActionId,
                };
                return this.cache.set(cacheKey, JSON.stringify(value), CACHE_LIMIT)
                  .then(() => {
                    return value;
                  });
              }
            });
        }
      });
  }
}
