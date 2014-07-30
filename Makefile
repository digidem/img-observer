all: \
	node_modules/.install \
	dist/document_change_observer.js \
	dist/document_change_observer.min.js

node_modules/.install: package.json
	npm install && touch node_modules/.install

dist/document_change_observer.js: index.js node_modules/.install
	mkdir -p $(dir $@)
	node_modules/.bin/browserify $< --standalone DocumentChangeObserver -o $@

dist/document_change_observer.min.js: dist/document_change_observer.js node_modules/.install
	node_modules/.bin/uglifyjs $< -c -m -o $@
