import gulp              from "gulp";
import nodemon           from "gulp-nodemon";
import stylus            from "gulp-stylus";
import nib               from "nib";
import minifyCSS         from "gulp-minify-css";
import sourcemaps        from "gulp-sourcemaps";
import rename            from "gulp-rename";
import webpack           from "webpack";
import webpackStream     from "webpack-stream";
import rimraf            from "rimraf";
import dotenv            from "dotenv";
import minimist          from "minimist";
import { fork }          from "child_process";
import fs                from "fs";
import path              from "path";

import prodWebpackConfig from "./config/webpack.prod";

////////////////////////////////////////////////////////////////
// 環境変数設定。
const env = dotenv.config().parsed;

////////////////////////////////////////////////////////////////
// 既存ビルドファイルを削除
gulp.task("clean", (callback) => {
  rimraf("./dist/**/*", callback);
});

////////////////////////////////////////////////////////////////
// 開発用
gulp.task("server", (_callback) => {
  nodemon({
    script: "./app/entry/server",
    ignore: ["app/front"],
    ext   : "js jsx",
    env,
  });
});

function stylusDev(entry) {
  gulp.src(`./app/asset/stylus/${entry}.styl`)
    .pipe(sourcemaps.init())
    .pipe(stylus({
      "use"        : [nib()],
      "include css": true,
      "paths"      : [
        "./node_modules/normalize.css/",
        "./node_modules/font-awesome/css/",
        "./node_modules/bootstrap/dist/css/",
      ],
    }))
    .on("error", (err) => console.error(err))
    .pipe(sourcemaps.write())
    .pipe(rename(`${entry}.css`))
    .pipe(gulp.dest("./dist"));
}

gulp.task("stylus:dev", () => {
  stylusDev("inside");
  stylusDev("login");
  stylusDev("pnc");
});

gulp.task("copy:dev", () => {
  // FontAwesome のフォントをコピー
  gulp.src("./node_modules/font-awesome/fonts/**")
    .pipe(gulp.dest("./dist/fonts"));
  // ファビコンをコピー
  gulp.src("./app/asset/favicon/**")
    .pipe(gulp.dest("./dist/"));
});

gulp.task("watch:dev", (_callback) => {
  gulp.watch("./app/asset/stylus/**/*.styl", ["stylus:dev"]);
});

////////////////////////////////////////////////////////////////
// 本番用

gulp.task("webpack:build", ["webpack:server:build", "webpack:client:build"]);

gulp.task("webpack:server:build", () => {
  return gulp.src("./app/entry/server.js")
    .pipe(webpackStream(prodWebpackConfig.server, webpack))
    .pipe(gulp.dest("./dist"));
});

gulp.task("webpack:client:build", () => {
  return gulp.src("./app/entry/client.js")
    .pipe(webpackStream(prodWebpackConfig.client, webpack))
    .pipe(gulp.dest("./dist"));
});


function stylusBuild(entry) {
  return gulp.src(`./app/asset/stylus/${entry}.styl`)
    .pipe(stylus({
      "use"        : [nib()],
      "include css": true,
      "paths"      : [
        "./node_modules/normalize.css/",
        "./node_modules/font-awesome/css/",
        "./node_modules/bootstrap/dist/css/",
      ],
    }))
    .pipe(minifyCSS({ advanced: false }))
    .pipe(rename(`${entry}.min.css`))
    .pipe(gulp.dest("./dist"));
}

gulp.task("stylus:build:inside", () => stylusBuild("inside"));
gulp.task("stylus:build:login", () => stylusBuild("login"));
gulp.task("stylus:build:pnc", () => stylusBuild("pnc"));

gulp.task("stylus:build", ["stylus:build:inside", "stylus:build:login", "stylus:build:pnc"]);

gulp.task("copy:build:fonts", () => {
  return gulp.src("./node_modules/font-awesome/fonts/**")
    .pipe(gulp.dest("./dist/fonts"));
});
gulp.task("copy:build:favicon", () => {
  return gulp.src("./app/asset/favicon/**")
    .pipe(gulp.dest("./dist/"));
});

gulp.task("copy:build", ["copy:build:fonts", "copy:build:favicon"]);

gulp.task("start:test", (cb) => {
  const child = fork("./dist/server.min.js", { env });
  child.on("exit", (code) => {
    if (code === 0) {
      cb();
    } else {
      throw new Error("Child process exited with non-zero return code.");
    }
  });
});

////////////////////////////////////////////////////////////////
// 入り口

gulp.task("dev", ["clean"], () => {
  ["server", "stylus:dev", "watch:dev", "copy:dev"].forEach(task =>
    gulp.start(task)
  );
});

gulp.task("build", ["clean"], () => {
  ["webpack:build", "stylus:build", "copy:build"].forEach(task =>
    gulp.start(task)
  );
});

gulp.task("test", () => {

});

gulp.task("script", (cb) => {
  const argv = minimist(process.argv.slice(2));
  const { script } = argv;
  if (script === true) {
    throw new Error("A script file argument is required.");
  // } else if (fs.readFileSync(path.resolve(process.cwd(), "bin", script))) {
  } else {
    const scriptPath = path.resolve(process.cwd(), script);
    fs.open(scriptPath, "r", (err) => {
      if (err) {
        throw new Error("Script file does not exist.");
      } else {
        const child = fork(scriptPath, { env });
        child.on("exit", (code) => {
          if (code === 0) {
            cb();
          } else {
            throw new Error("Child process exited with non-zero return code.");
          }
        });
      }
    });
  }
});
