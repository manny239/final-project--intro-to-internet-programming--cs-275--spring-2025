const { src, dest, series, watch } = require(`gulp`),
    CSSLinter = require(`gulp-stylelint`),
    { deleteAsync } = require(`del`),
    babel = require(`gulp-babel`),
    jsCompressor = require(`gulp-uglify`),
    jsLinter = require(`gulp-eslint`),
    browserSync = require(`browser-sync`),
    htmlValidator = require(`gulp-html`),
    htmlCompressor = require(`gulp-htmlmin`),
    cssCompressor = require(`gulp-clean-css`),
    reload = browserSync.reload;

let browserChoice = `default`;

async function brave () { browserChoice = `brave browser`; }
async function chrome () { browserChoice = `google chrome`; }
async function edge () { browserChoice = `microsoft edge`; }
async function firefox () { browserChoice = `firefox`; }
async function opera () { browserChoice = `opera`; }
async function safari () { browserChoice = `safari`; }
async function vivaldi () { browserChoice = `vivaldi`; }
async function allBrowsers () {
    browserChoice = [
        `brave browser`,
        `google chrome`,
        `microsoft edge`,
        `firefox`,
        `opera`,
        `safari`,
        `vivaldi`
    ];
}

let validateHTML = () => {
    return src(`app/html/**/*.html`)
        .pipe(htmlValidator(undefined));
};

let lintCSS = () => {
    return src(`app/css/**/*.css`)
        .pipe(CSSLinter({
            failAfterError: false,
            reporters: [
                {formatter: `string`, console: true}
            ]
        }));
};

let lintJS = () => {
    return src(`app/js/*.js`)
        .pipe(jsLinter())
        .pipe(jsLinter.formatEach(`compact`));
};

let transpileJSForDev = () => {
    return src(`app/js/*.js`)
        .pipe(babel())
        .pipe(dest(`temp/js`));
};

let compressHTML = () => {
    return src(`app/html/**/*.html`)
        .pipe(htmlCompressor({ collapseWhitespace: true }))
        .pipe(dest(`prod/html`));
};

let compressCSS = () => {
    return src(`app/css/**/*.css`)
        .pipe(cssCompressor())
        .pipe(dest(`prod/css`));
};

let compileCSSForProd = () => {
    return src(`app/css/*.css`)
        .pipe(dest(`prod/css`));
};

let transpileJSForProd = () => {
    return src(`app/js/*.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`prod/js`));
};

let copyUnprocessedAssetsForProd = () => {
    return src([
        `app/*.*`,
        `app/**`,
        `!app/html/`,
        `!app/html/*.*`,
        `!app/html/**`,
        `!app/img/`,
        `!app/img/.gitignore`,
        `!app/**/*.js`,
        `!app/css/**`
    ], {dot: true})
        .pipe(dest(`prod`));
};

let serve = () => {
    browserSync({
        notify: true,
        reloadDelay: 50,
        browser: browserChoice,
        server: {
            baseDir: [
                `temp`,
                `app`,
                `app/html`
            ]
        }
    });

    watch(`app/html/**/*.html`, validateHTML).on(`change`, reload);
    watch(`app/css/**/*.css`, lintCSS).on(`change`, reload);
    watch(`app/js/*.js`, series(lintJS, transpileJSForDev)).on(`change`, reload);
    watch(`app/img/**/*`).on(`change`, reload);
};

async function clean() {
    const foldersToDelete = await deleteAsync([`./temp`, `prod`]);
    console.log(`The following directories were deleted:`, foldersToDelete);
}

async function listTasks () {
    let exec = require(`child_process`).exec;
    exec(`gulp --tasks`, function (error, stdout) {
        if (null !== error) {
            console.log(`An error was generated when invoking the “exec” program in the default task.`);
        }
        console.log(`\n\tThis default task does nothing but generate this message. The available tasks are:\n\n${stdout}`);
    });
}

exports.brave = series(brave, serve);
exports.chrome = series(chrome, serve);
exports.edge = series(edge, serve);
exports.firefox = series(firefox, serve);
exports.opera = series(opera, serve);
exports.safari = series(safari, serve);
exports.vivaldi = series(vivaldi, serve);
exports.allBrowsers = series(allBrowsers, serve);

exports.validateHTML = validateHTML;
exports.lintCSS = lintCSS;
exports.lintJS = lintJS;
exports.transpileJSForDev = transpileJSForDev;
exports.compressHTML = compressHTML;
exports.compressCSS = compressCSS;
exports.compileCSSForProd = compileCSSForProd;
exports.transpileJSForProd = transpileJSForProd;
exports.copyUnprocessedAssetsForProd = copyUnprocessedAssetsForProd;
exports.clean = clean;
exports.default = listTasks;

exports.serve = series(
    validateHTML,
    lintCSS,
    lintJS,
    transpileJSForDev,
    serve
);

exports.build = series(
    compressHTML,
    compressCSS,
    compileCSSForProd,
    transpileJSForProd,
    copyUnprocessedAssetsForProd
);
