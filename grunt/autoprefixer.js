module.exports = function (grunt) {

    var app = grunt.option('app');

    grunt.config('autoprefixer', {

        options: {
            browsers: ['last 2 versions', 'ie 8', 'ie 9', 'android 2.3', 'android 4', 'opera 12']
        },

        app: {
            src: app.less.dest
        }

    });

};
