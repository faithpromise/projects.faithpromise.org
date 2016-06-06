module.exports = function (grunt) {

    var app = grunt.option('app');

    grunt.config('less', {

        app: {
            src:     app.less.src,
            dest:    app.less.dest,
            options: { compress: grunt.option('production') || false }
        },

        bootstrap: {
            src:     'frontend/less/bootstrap.less',
            dest:    'public/build/bootstrap.css',
            options: { compress: grunt.option('production') || false }
        }

    });

};
