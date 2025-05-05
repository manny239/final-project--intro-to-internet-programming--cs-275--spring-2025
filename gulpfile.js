const { src, dest, series, parallel, watch } = require(`gulp`),
    CSSLinter     = require(`gulp-stylelint`),
    htmlValidator = require(`gulp-html-validator`),
    eslint        = require(`gulp-eslint`),
    babel         = require(`gulp-babel`),
    htmlMin       = require(`gulp-htmlmin`),
    cleanCSS      = require(`gulp-clean-css`),
    uglify        = require(`gulp-uglify`),
    del           = require(`del`),
    browserSync   = require(`browser-sync`).create();

let clean = async () => {
    let deleted = await del([`./dev`, `./prod`]);
    console.log(`Deleted folders:`, deleted);
};

let validateHTML = () =>
    src(`app/html/**/*.html`)
        .pipe(htmlValidator({ verbose: true }));

let validateCSS = () =>
    src(`app/css/**/*.css`)
        .pipe(CSSLinter({
            failAfterError: false,
            reporters: [{ formatter: `string`, console: true }]
        }));

let validateJS = () =>
    src(`app/js/**/*.js`)
        .pipe(eslint())
        .pipe(eslint.formatEach(`compact`));

let copyHTMLToDev = () =>
    src(`app/html/**/*.html`)
        .pipe(dest(`dev`));

let copyCSSToDev = () =>
    src(`app/css/**/*.css`)
        .pipe(dest(`dev/css`));

let transpileJSForDev = () =>
    src(`app/js/**/*.js`)
        .pipe(babel({ presets: [`@babel/preset-env`] }))
        .pipe(dest(`dev/js`));

let serve = () => {
    browserSync.init({
        notify: true,
        server: { baseDir: [`dev`] },
    });

    watch(`app/html/**/*.html`,
        series(validateHTML, copyHTMLToDev)
    ).on(`change`, browserSync.reload);

    watch(`app/css/**/*.css`,
        series(validateCSS, copyCSSToDev)
    ).on(`change`, browserSync.reload);

    watch(`app/js/**/*.js`,
        series(validateJS, transpileJSForDev)
    ).on(`change`, browserSync.reload);
};

let dev = series(
    clean,
    parallel(validateHTML, validateCSS, validateJS),
    parallel(copyHTMLToDev, copyCSSToDev, transpileJSForDev),
    serve
);

let compressHTML = () =>
    src(`app/html/**/*.html`)
        .pipe(htmlMin({ collapseWhitespace: true }))
        .pipe(dest(`prod`));

let compressCSS = () =>
    src(`app/css/**/*.css`)
        .pipe(cleanCSS())
        .pipe(dest(`prod/css`));

let transpileJSForProd = () =>
    src(`app/js/**/*.js`)
        .pipe(babel({ presets: [`@babel/preset-env`] }))
        .pipe(dest(`prod/js`));

let compressJS = () =>
    src(`prod/js/**/*.js`)
        .pipe(uglify())
        .pipe(dest(`prod/js`));

let build = series(
    clean,
    parallel(
        compressHTML,
        compressCSS,
        series(transpileJSForProd, compressJS)
    )
);

exports.validateHTML = validateHTML;
exports.validateCSS        = validateCSS;
exports.validateJS         = validateJS;
exports.transpileJSForDev  = transpileJSForDev;
exports.compressHTML       = compressHTML;
exports.compressCSS        = compressCSS;
exports.transpileJSForProd = transpileJSForProd;
exports.compressJS         = compressJS;
exports.default            = dev;
exports.build              = build;
