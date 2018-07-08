import Inject from "app/lib/di/Inject";

// JSON を各種オブジェクト型にフォーマットする

@Inject()
export default class TwitterModel {
  static injectionName = "TwitterModel";
  formatProfile(rawProfile) {
    return {
      twitterId        : rawProfile.id_str,
      screenName       : rawProfile.screen_name,
      name             : rawProfile.name,
      description      : rawProfile.description,
      protected        : rawProfile.protected,
      followersCount   : rawProfile.followers_count,
      friendsCount     : rawProfile.friends_count,
      statusesCount    : rawProfile.statuses_count,
      lang             : rawProfile.lang,
      status           : rawProfile.status && this.formatTweet(rawProfile.status),
      following        : rawProfile.following,
      followRequestSent: rawProfile.follow_request_sent,
      profileImageUrl  : rawProfile.profile_image_url_https,
    };
  }

  formatTweet(rawTweet) {
    return {
      statusId           : rawTweet.id_str,
      createdAt          : new Date(rawTweet.created_at),
      inReplyToTwitterId : rawTweet.in_reply_to_user_id_str,
      inReplyToStatusId  : rawTweet.in_reply_to_status_id_str,
      inReplyToScreenName: rawTweet.in_reply_to_screen_name,
      retweetedStatus    : rawTweet.retweeted_status && this.formatTweet(rawTweet.retweeted_status),
      quotedStatus       : rawTweet.quoted_status && this.formatTweet(rawTweet.quoted_status),
      text               : rawTweet.text,
      user               : rawTweet.user && this.formatProfile(rawTweet.user),
      lang               : rawTweet.lang,
      source             : rawTweet.source.replace(/^<[^>]+>([^<]+)<[^>]+>$/, "$1"),
      sourceUrl          : rawTweet.source.replace(/^<.+href="([^"]+)".+$/, "$1"),
    };
  }

  formatOnFavorited(rawData) {
    return {
      sourceProfile: this.formatProfile(rawData.source),
      targetProfile: this.formatProfile(rawData.target),
      targetTweet  : this.formatTweet(rawData.target_object),
    };
  }
}
