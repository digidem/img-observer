// Monitors any nodes matching `tagName` added to or removed to a document node
// (defaults to `document.body`), and emits an `added` or `removed` 
// event passing an array of all the nodes added or removed.

var EventEmitter = require('events').EventEmitter;

module.exports = function(root, tagName) {
    root = root || document.body;
    tagName = tagName.toUpperCase() || "IMG";
    var event = new EventEmitter();

    // If the browser does not support MutationObserver, returns `undefined`
    if (!window.MutationObserver) return;

    // Create a new observer
    var observer = new MutationObserver(function(mutations) {
        var key,
            nodesById = {
                added: {},
                removed: {}
            },
            addedNodes = [],
            removedNodes = [],
            idCounter = 0;

        // We need to track the ID of each node added and removed,
        // because a single mutation event might include the same node
        // being added and removed
        function id(node) {
            return node.__imgobserverid__ || (node.__imgobserverid__ = ++idCounter + '');
        }

        // The mutations observer can be called with several mutations at a time
        mutations.forEach(function(mutation) {
            // Check whether any added nodes are an IMG tag, and if so
            // add them to the list of added nodes, and delete them from 
            // the list of removed nodes.
            filterNodes(mutation.addedNodes, tagName).forEach(function(node) {
                nodesById.added[id(node)] = node;
                delete nodesById.removed[id(node)];
            });
            // Similarly check the removed IMG tags
            filterNodes(mutation.removedNodes, tagName).forEach(function(node) {
                nodesById.removed[id(node)] = node;
                delete nodesById.added[id(node)];
            });
        });

        // Flatten the list of added and removed matching nodes to arrays
        for (key in nodesById.added) {
            if (!nodesById.added.hasOwnProperty(key)) continue;
            addedNodes.push(nodesById.added[key]);
        }
        for (key in nodesById.removed) {
            if (!nodesById.removed.hasOwnProperty(key)) continue;
            removedNodes.push(nodesById.removed[key]);
        }

        // If any matching nodes were added or removed, emit an event
        // with an array of the nodes.
        if (addedNodes.length) event.emit('added', addedNodes);
        if (removedNodes.length) event.emit('removed', removedNodes);
    });

    // Loops through a node list and returns all the nodes that match
    // a tag name.
    function filterNodes(nodeList, tagName) {
        var matched = [];
        for (var i = 0; i < nodeList.length; ++i) {
            // Only check node nodes, not text or script nodes.
            if (nodeList[i].nodeType !== Node.ELEMENT_NODE) continue;
            // Check if the root node is what we are looking for
            if (nodeList[i].tagName === tagName) {
                matched.push(nodeList[i]);
                // If the node has no children, continue to next node
                if (!nodeList[i].children.length) continue;
            }
            
            // Check for any children
            var imgs = nodeList[i].getElementsByTagName(tagName);
            for (var j = 0; j < imgs.length; ++j) {
                matched.push(imgs[j]);
            }
        }
        return matched;
    }

    observer.observe(root, {
        // Required, and observes additions
        // or deletion of child nodes
        childList: true,
        // Observes the addition or deletion
        // of “grandchild” nodes
        subtree: true
    });

    return event;
};
