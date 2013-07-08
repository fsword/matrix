#
# usage: make
#

v3:
	#cp -r _p/* p/
	#cp -r _p/inc/link_release.shtml p/inc/link.shtml

	lessc --compress less/demo.less > css/demo.css

	date

#
# usage: make watch
#

watch:
	echo "Watching less files..."; \
	watchr -e "watch('_c/.*\') { system 'make' }"



