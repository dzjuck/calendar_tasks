module.exports = function(grunt) {
  var base = "js1000/";
  grunt.initConfig({
    //pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';\n'
      },
      dist: {
        src: [ 'node_modules/angular/angular.js', 'js/ui-bootstrap-custom-2.5.0.min.js', 'js/ui-bootstrap-custom-tpls-2.5.0.min.js', 'js/today_app.js', 'js/nebPay.js', 'js/dailyHabitsContractApi.js', 'js/controllers/todoCtrl.js', 'js/directives/todoFocus.js', 'js/directives/todoEscape.js', 'js/services/blockChainService.js' ],
        dest: 'js/all.js'
      },

      css: {
            src: ['node_modules/todomvc-app-css/index.css', 'js/ui-bootstrap-custom-2.5.0-csp.css' ],
            dest: 'css/all.css'
      },

    },
    uglify: {
      dist: {
          src: ['<%= concat.dist.dest %>'],
          dest: 'js/all.min.js'
      },
    },
    cssmin: {
        css:{
            src: ['css/all.css' ],
            dest: 'css/all.min.css'
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
//  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');

  grunt.registerTask('default', ['concat', /*'uglify',*/ 'cssmin']);

};
