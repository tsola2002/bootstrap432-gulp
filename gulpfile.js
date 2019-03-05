//use nodejs's require command to bring in gulp library & assign it to a variable called gulp
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('pngcrush'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    less = require('gulp-less');

//making declaration of necessary variables that will be used later on
var env,
    jsSources,
    lessSources,
    htmlSources,
    outputDir;

//check to see that environment variables is set, if not set it to development environment
var env = process.env.NODE_ENV || 'development';

//using a conditional to modify how the output is used
if (env==='development')  {
    outputDir = 'builds/development/';
} else {
    outputDir = 'builds/production/';
}

//javascript files that need to be combined
jsSources = [
    'components/js/alert.js',
    'components/js/button.js',
    'components/js/carousel.js',
    'components/js/collapse.js',
    'components/js/dropdown.js',
    'components/js/index.js',
    'components/js/modal.js',
    'components/js/popover.js',
    'components/js/scrollspy.js',
    'components/js/tab.js',
    'components/js/toast.js',
    'components/js/tooltip.js',
    'components/js/util.js'
];

customJsSources = [
    'components/js/custom.js'
];



sassSources = [
    'components/less/bootstrap.less',
    'components/less/custom.less',
    'components/less/fontawesome/font-awesome.less'
];

//html files that need to be processed

htmlSources = [outputDir + '*.html'];

gulp.task('less', function(){
    //specify where less files are located
    gulp.src(lessSources)
    //convert the less files to css files
        .pipe(less())
        //spit log message if there are any errors
        .on('error', gutil.log)
        //autoprefix the less files
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        //output final files to destination folder
        .pipe(gulp.dest(outputDir + 'css'))
        //do a reload on the server
        .pipe(connect.reload())
});


gulp.task('log', function(){
    //output piece of text to the console
    gutil.log('Workflows are awesome');
});

gulp.task('process-js', function() {
    //gather input sources to be concatenated
    gulp.src(customJsSources)
        .pipe(gulpif(env === 'production', uglify()))
        //output final file to destination folder
        .pipe(gulp.dest(outputDir + 'js'))
        //do a reload on the server
        .pipe(connect.reload())
});

gulp.task('combine-js', function() {
    //gather input sources to be concatenated
    gulp.src(jsSources, customJsSources)
    //concatenate js file into a bootstrap.js file
    //pipe method will send output of previous function to the function below
        .pipe(concat('bootstrap.js'))
        //use conditional to determine whether to minify the file or not based on the environment settings
        .pipe(gulpif(env === 'production', uglify()))
        //output final file to destination folder
        .pipe(gulp.dest(outputDir + 'js'))
        //do a reload on the server
        .pipe(connect.reload())
});

gulp.task('watch', function() {
    //when any lessSources file changes run less method
    gulp.watch(lessSources, ['less']);
    //when any jsSources file changes run combine-js method
    gulp.watch(jsSources, ['combine-js']);
    //when any customJsSources file changes run process-js method
    gulp.watch(customJsSources, ['process-js']);
    //when any file with a .less extension changes, we run the less task
    gulp.watch('components/less/*.less', ['less']);
    //when any html file changes do a livereload
    gulp.watch('builds/development/*.html', ['html']);
    //when any html file changes do a livereload
    gulp.watch('builds/development/images/**/*.*', ['images']);
});



gulp.task('connect', function() {
    //use connect variable's of the server method to create a server
    connect.server({
        //specify the root of your application
        root: outputDir,
        //turn on livereload feature
        livereload: true
    });
});

gulp.task('html', function() {
    //set input sources to html files
    gulp.src('builds/development/*.html')
    //if the environment is production then minify the html
        .pipe(gulpif(env === 'production', minifyHTML()))
        //send the minified html files to production folder
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        //pipe the sources to livereload
        .pipe(connect.reload())
});

gulp.task('minify-css', function() {
    //set input sources to css files
    gulp.src('builds/development/css/*.css')
    //if the environment is production then minify the css
        .pipe(gulpif(env === 'production', minifyCSS({keepSpecialComments: 1})))
        //send the minified html files to production folder
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'css')))
        //pipe the sources to livereload
        .pipe(connect.reload())
});

gulp.task('images', function() {
    //set input files to the folders in images folder & any folder with (.) in it
    gulp.src('builds/development/images/**/*.*')
    // if its in production run image minification
        .pipe(gulpif(env === 'production', imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngcrush()]
        })))
        //if its in production send the minified images to their destination in production folder
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
        .pipe(connect.reload())
});







//custom gulp task to run all tasks
gulp.task('default', ['html', 'less', 'combine-js', 'process-js', 'log', 'images', 'connect', 'watch', 'minify-css']);
