import Inject              from "app/lib/di/Inject";
import Cache               from "app/lib/external/Cache";

import PNCPointLogs        from "app/model/PNCPointLogs";

import PNCAccessKeyHelper  from "app/service/helper/PNCAccessKeyHelper";
import { serviceName }     from "app/front/service/PNCPointLogService";

const CACHE_PREFIX = "PNCPongLog-data-";
const LENGTH_PER_PAGE = 20;
const LIMIT_10_MIN = 600000;

@Inject({
  cache             : Cache,
  pncPointLogs      : PNCPointLogs,
  pncAccessKeyHelper: PNCAccessKeyHelper,
})
export default class PNCPointLogService {
  static injectionName = "PNCPointLogService";
  constructor({ cache, pncPointLogs, pncAccessKeyHelper }) {
    this.cache              = cache;
    this.pncPointLogs       = pncPointLogs;
    this.pncAccessKeyHelper = pncAccessKeyHelper;
  }
  name = serviceName;

  extractCore(pointLog) {
    return {
      statusId : pointLog.statusId,
      number   : pointLog.number,
      point    : pointLog.point,
      pointType: pointLog.pointType,
      createdAt: pointLog.createdAt,
    };
  }
  formatReadValue(page, data) {
    // page は 1 始まり
    const startIndex = (page - 1) * LENGTH_PER_PAGE;
    const endIndex = page * LENGTH_PER_PAGE;
    return {
      pointLogList: data.pointLogList.slice(startIndex, endIndex).map(this.extractCore),
      hasNext     : data.pointLogList.length > endIndex,
      aggregatedAt: data.aggregatedAt,
    };
  }
  read(_req, _resource, params, _config, callback) {
    const { accessKey, page } = params;
    const cacheKey = CACHE_PREFIX + accessKey;

    this.pncAccessKeyHelper.confirmAccessKey(accessKey)
      .then(({ twitterId }) => {
        if (! twitterId) {
          callback(null, {});
        } else {
          this.cache.get(cacheKey)
            .then(data => {
              if (data) {
                callback(
                  null,
                  this.formatReadValue(page, data)
                );
              } else {
                return this.pncPointLogs.readByTwitterId(twitterId)
                  .then(data => {
                    const cacheValue = {
                      pointLogList: data || [],
                      aggregatedAt: new Date(),
                    };
                    this.cache.set(cacheKey, cacheValue, LIMIT_10_MIN);
                    callback(null, this.formatReadValue(page, cacheValue));
                  });
              }
            })
            .catch(e => callback(e));
        }
      });
  }
  create(_req, _resource, _params, _body, _config, callback) {
    callback("Not implemented yet.");
  }
  update(_req, _resource, _params, _body, _config, callback) {
    callback("Not implemented yet.");
  }
  delete(_req, _resource, _params, _config, callback) {
    callback("Not implemented yet.");
  }
}
