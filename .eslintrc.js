module.exports = {
  // デフォルトではすべてオフなので、推奨設定を上書きするスタイルでいく
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "rules": {
    // インデントを2で固定
    // switch 内で indent するように指定
    "indent": [2, 2, { "SwitchCase": 1 } ],
    // ダブルクオーテーションに固定
    "quotes": [2, "double"],
    // 改行は LF
    "linebreak-style": [2, "unix"],
    // 常にセミコロンを求める
    "semi": [2, "always"],
    // 未使用の変数は warning
    // ただし例外として、
    // 変数の React
    // 引数の _ から始まるもの
    // は許可する
    "no-unused-vars": [1, {
      "vars": "all",
      "args": "all",
      "varsIgnorePattern": "^React$",
      "argsIgnorePattern": "^_"
    }],
    // 宣言してない変数の使用禁止
    "no-undef": 2,
    // console.log とかは 許容
    "no-console": 0,
    // 比較は === を使う
    "eqeqeq": 2,
    // オブジェクトや配列の最後にコンマが残っているのを許す
    // むしろ複数行時に残ってない場合に警告
    "comma-dangle": [1, "always-multiline"],
    // 1ファイルに複数のクラスがあり、
    //   static propTypes
    // を設定していると、 no-redeclare に引っかかることがあるよう。
    "no-redeclare": 1,
  },
  // ES7 のため
  "parser": "babel-eslint",
  "env": {
    "es6": true,
    "node": true,
    "browser": true
  },
  "plugins": ["react"]
};
