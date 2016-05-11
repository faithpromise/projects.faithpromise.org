module.exports = function (grunt) {

    var app = grunt.option('app');

    grunt.config('watch', {

        app_css: {
            files: ['frontend/less/**/*.less'],
            tasks: ['css']
        },

        app_js: {
            files: ['frontend/js/**/*.js'],
            tasks: ['uglify:app']
        },

        app_templates: {
            files: ['frontend/js/**/*.html'],
            tasks: ['copy:app_templates']
        }

    });

    grunt.registerTask('watch_app', [
        'watch:app_css',
        'watch:app_js',
        'watch:app_templates'
    ]);

};