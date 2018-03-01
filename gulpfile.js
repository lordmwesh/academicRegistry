var gulp = require('gulp'),
	less = require('gulp-less'),
	watch = require('gulp-watch');

// Compile less to css
gulp.task('less', function () {
	gulp.src('public/theme/style.less')
	  .pipe(less()).on('error',function(e){ console.log(e); })
	  .pipe(gulp.dest('public/stylesheets'));
});

// Watch on files changes
gulp.task('watch', function() {
	gulp.watch('public/theme/*.less', ['less']);
});

gulp.task('default', ['watch']);