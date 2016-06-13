module.exports = function (grunt) {

    var app = grunt.option('app');

    grunt.config('postcss', {

        options: {
            processors: [
                require('autoprefixer')({
                    browsers: ['last 2 versions', 'ie 8', 'ie 9', 'android 2.3', 'android 4', 'opera 12'],
                    supports: false,
                    remove:   false
                })
            ]
        },

        app: {
            src: app.less.dest
        }

    });

};