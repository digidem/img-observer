ImgObserver
========================

Monitors an HTML document for added or removed `img` nodes, dispatching 'added' and 'removed' events with an array or added or removed `img` tags, and 'changed' events with an array of img tags with a changed `src` attribute.

A previous version of this library was named `document-change-observer` and was originally a more generic wrapper for `MutationObserver`, but for that use [mutation-summary](https://github.com/rafaelw/mutation-summary)

### Usage Browserify

```javascript
var observer = require('img-observer')(document.body);

observer.on('added', function(imgs) {
    // ... do something with array of added `img` elements
}

observer.on('removed', function(imgs) {
    // ... do comething with array of removed `img` elements
})

observer.on('changed', function(imgs) {
    // ... do comething with array of `img` elements with changed `src` attributes
})
```

### Standalone usage

```html
<script src="dist/img-observer.js></script>

<script>
var observer = ImgObserver(document.body);
</script>
```

### ImgObserver(node)

Returns an observer that listens for mutations of img elements that are children of `node`. Is an instance of [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter).

### observer.disconnect()

Stops listening for DOM mutations, but does not remove event listeners.

### observer.connect()

Starts listening for DOM mutations again.

### observer.removeAllListeners()

Remove all listeners attached to the observer.
