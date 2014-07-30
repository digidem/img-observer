Document Change Observer
========================

Monitors an HTML document for added or removed nodes, dispatching 'added' and 'removed' events with an array or added or removed nodes. Developed to monitor `img` elements being added to or removed from the page, but can match any tagName. In the future it should match by a valid [selector](http://www.w3.org/TR/selectors/#selectors) but for now it just matches an exact tagName match.

#### Usage Browserify

```javascript
var observer = require('document-change-observer')(document.body, 'IMG');

observer.on('added', function(imgs) {
    // ... do something with array of added `img` elements
}

observer.on('removed', function(imgs) {
    // ... do comething with array of removed `img` elements
})
```

#### Standalone usage

```html
<script src="dist/document-change-observer.js></script>

<script>
var observer = DocumentChangeObserver(document.body, 'IMG');
</script>
```

### To Do

- [ ] Filter changes by selector, not just by tagname
- [ ] Add method to turn off the observer
