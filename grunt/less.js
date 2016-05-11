module.exports = function (grunt) {

    var app = grunt.option('app');

    grunt.config('less', {

        app: {
            src:     app.less.src,
            dest:    app.less.dest,
            options: { compress: grunt.option('production') || false }
        }

    });

};
