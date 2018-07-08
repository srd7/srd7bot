import _                from "underscore";
import Inject           from "app/lib/di/Inject";

import TwitterApi       from "app/lib/twitter/api";

import AccountRanks     from "app/model/AccountRanks";

const whiteTwitterIdList = ["2496644772"]; // @srnk6
const defaultPermitLangList = ["ja", "en"];
// Regular expression of Arabic
const arabic = /.*[א-ޥ]+.*/;

@Inject({ twitterApi: TwitterApi, accountRanks: AccountRanks })
export default class RankLogic {
  constructor({ twitterApi, accountRanks }) {
    this.twitterApi   = twitterApi;
    this.accountRanks = accountRanks;
  }

  /**
   * アカウントランク周りのエラーハンドル
   */
  handleProfileError(twitterId) {
    const accountRanks = this.accountRanks;
    return (e) => {
      switch (e.code) {
        case 50: {
          // 存在しないユーザー
          return accountRanks.remove(twitterId);
        }
        case 63: {
          // アカウントが凍結中の場合
          return accountRanks.upsert({ twitterId }, accountRanks.ACCOUNT_RANK_SUSPENDED);
        }
        case 88: {
          // 制限越え
          return Promise.resolve();
        }
        default: {
          // 原因不明のエラーは外側で処理させる
          return Promise.reject(e);
        }
      }
    };
  }

  /**
   * そのアカウントのランクをチェックし、
   * DB に書き込む。
   */
  checkRank(account, profile) {
    const accountRanks = this.accountRanks;
    if (this.isWhite(account, profile)) {
      return accountRanks.ACCOUNT_RANK_WHITE;
    } else if (this.isBlack(account, profile)) {
      return accountRanks.ACCOUNT_RANK_BLACK;
    } else if (this.isGray(account, profile)) {
      return accountRanks.ACCOUNT_RANK_GRAY;
    } else {
      return accountRanks.ACCOUNT_RANK_WHITE;
    }
  }

  /**
   * アカウントのランクのチェックを行う。
   * チェック対象は、アカウントのフォローおよびフォロワーで、
   * チェック日が古いもの or そもそもチェックされていないもの。
   */
  updateRank(account, max) {
    const accountRanks = this.accountRanks;
    return Promise.all([
      this.twitterApi.getFollowings(account, account.twitterId),
      this.twitterApi.getFollowers(account, account.twitterId),
      accountRanks.getRecentList(),
    ])
      .then(([followingList, followerList, recentAccountRankList]) => {
        // フォロー中
        const followingIdList = followingList.ids;
        // フォロワー
        const followerIdList = followerList.ids;

        const checkTargetIdList = _.chain([])
          .union(followingIdList, followerIdList)
          .difference(recentAccountRankList.map(ar => ar.twitterId))
          .slice(0, max)
          .value();

        checkTargetIdList.forEach(twitterId =>
          this.twitterApi.getProfile(account, twitterId)
            .then(profile => {
              const rank = this.checkRank(account, profile);
              accountRanks.upsert(profile, rank);
            })
            .catch(this.handleProfileError(twitterId))
        );
      });
  }

  /**
   * ホワイトの条件を満たすか？
   * 現状ホワイトリストに入っているかどうかのみ。
   */
  isWhite(_account, profile) {
    return _.contains(whiteTwitterIdList, profile.twitterId);
  }

  /**
   * ブラックの条件を満たすか？
   *
   * ブラックの条件としては
   *
   * 1. 言語が ja or en 以外 (ar とか)
   * 2. 名前やdescriptionにアラビア語が含まれる
   *    ただし顔文字的な使い方も考えられるので、
   *    言語が ja or en ならアラビア語があっても許容する。
   * 3. フォロー数がフォロワー数よりも明らかに多い
   *    フォロー / フォロワー が
   *      A. 100 以上
   *      B. 10以上かつフォロー数が300以上（明らかにフォローしまくり）
   * 4. フォロワー数がフォロー数よりも明らかに多い
   *    フォロワー / フォロー が
   *      A. 200 以上
   *      B. 50 以上かつフォロワー数が1000以上
   *    フォローするとリムーブされる可能性が高そうなアカウント。
   * TODO: キーワードやRTしかしていないアカウントを除外したい
   */
  isBlack(account, profile) {
    const { name, description, lang, followersCount, friendsCount } = profile;
    const permitLangList = account.botConfig.permitLangList || defaultPermitLangList;
    return [
      ! _.contains(permitLangList, lang),
      lang !== "ja" && (name.match(arabic) || description.match(arabic)),
      friendsCount / followersCount > 100,
      friendsCount / followersCount > 10 && friendsCount > 300,
      followersCount / friendsCount > 200,
      followersCount / friendsCount > 50 && followersCount > 1000,
    ].some(_.identity);
  }

  /**
   * グレーの条件を満たすか？
   *
   * グレーの条件としては
   *
   * 1. フォロワー > フォロー
   * 2. ツイートが存在しないか1年以上更新されていない
   * TODO: キーワードやRTしかしていないアカウントを除外したい
   */
  isGray(_account, profile) {
    const { followersCount, friendsCount, status } = profile;
    return [
      followersCount > friendsCount,
      ! status,
      status && status.createdAt < Date.now() - 1000 * 86400 * 365,
    ].some(_.identity);
  }
}
