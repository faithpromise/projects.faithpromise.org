module.exports = function (grunt) {

    var app = grunt.option('app');

    grunt.config('uglify', {

        app: {
            src:     app.js.src,
            dest:    app.js.dest,
            options: {
                compress: false,
                mangle:   false,
                beautify: !grunt.option('production') || false,
                screwIE8: true
            }
        }

    });

};
