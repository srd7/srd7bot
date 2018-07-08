import { createClient } from "redis";
import Inject           from "app/lib/di/Inject";

@Inject()
export default class Cache {
  static injectionName = "Cache";
  constructor() {
    const client = createClient({
      url: process.env.REDIS_URL,
    });
    this.client = client;
  }

  /**
   * デフォルトで async のものを利用する
   */
  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          try {
            resolve(JSON.parse(value));
          } catch (e) {
            // エラーが出たらそのキーは削除しよう
            this.client.del(key, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(null);
              }
            });
          }
        }
      });
    });
  }

  set(key, value, expire) {
    return new Promise((resolve, reject) => {
      this.client.set(key, JSON.stringify(value), "PX", expire, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }
}
