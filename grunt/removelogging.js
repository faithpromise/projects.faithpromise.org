module.exports = function (grunt) {

    var app = grunt.option('app');

    grunt.config('removelogging', {

        app: {
            src: app.output_dir + '/**/*.js'
        }

    });

};
