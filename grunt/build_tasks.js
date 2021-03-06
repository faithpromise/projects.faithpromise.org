module.exports = function (grunt) {

    grunt.registerTask('copy_files', ['copy:app_templates', 'copy:app_fontello', 'copy:app_images', 'copy:app_angular_ui']);

    grunt.registerTask('css', ['less:app', 'less:bootstrap', 'postcss:app']);

    grunt.registerTask('build_app', ['uglify:app', 'copy_files', 'css']);

    grunt.registerTask('build_release', ['clean:build', 'clean:release', 'build_app', 'copy:release_backend', 'copy:release_frontend', 'copy:release_uib', 'removelogging:app']);

    grunt.registerTask('deploy', ['build_release', 'git_deploy', 'clean:release']);

};
