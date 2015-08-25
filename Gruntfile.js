module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        options: {
          beautify: true,
          compress: false,
          mangle: false,
          preserveComments: true
        },
        src: ['src/*/*.js', 'src/*.js'],
        dest: 'build/scaled.js'
      },
      min: {
        options: {
          compress: {
            drop_console: true
          }
        },
        src: ['src/**/*.js'],
        dest: 'build/scaled.min.js'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
      options: {
        'sub': true,
        'loopfunc': true,
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= uglify.build.src %>'],
      tasks: ['jshint', 'uglify:build', 'uglify:min']
    },
    release: {
      options: {
        changelog: false,
        additionalFiles: ['bower.json'],
        add: true,
        commit: true,
        tag: false,
        push: true,
        pushTags: false,
        npm: false,
        npmtag: false,
        commitMessage: '[ScaledJS] Release Commit <%= version %>',
        tagMessage: 'Release Build <%= version %>',
        github: {
          repo: 'vasumahesh1/scaledjs',
          accessTokenVar: 'GITHUB_ACCESS_TOKEN'
        }
      }
    },
    version: {
      scaledVersion: {
        src: ['package.json', 'bower.json']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-version');

  // Tasks
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('build', ['jshint', 'uglify:build']);
  grunt.registerTask('min', ['jshint', 'uglify:min']);
  grunt.registerTask('buildAll', ['jshint', 'uglify:build', 'uglify:min']);
  grunt.registerTask('dev', ['watch']);

};