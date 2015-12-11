// Monitors any nodes matching `tagName` added to or removed to a document node
// (defaults to `document.body`), and emits an `added` or `removed`
// event passing an array of all the nodes added or removed.
var inherits = require('inherits')
var EventEmitter = require('events')

var mutationObserverInitOptions = {
  // Required, and observes additions or deletion of child nodes
  childList: true,
  // Observes the addition or deletion of “grandchild” nodes
  subtree: true,
  // Observe mutations to target's attributes
  attributes: true,
  // record  target's attribute value before the mutation
  attributeOldValue: true,
  // Only observe changes to `src` attribute
  attributeFilter: ['src']
}
var idCounter = 0
/**
 * Attaches a unique id to a given node/object, or returns the id.
 * We need to track the ID of each node added and removed,
 * because a single mutation event might include the same node
 * being added and removed
 * @param {object} node
 * @return {string} returns unique id of object
 */
function id (node) {
  return node.__imgobserverid__ || (node.__imgobserverid__ = ++idCounter + '')
}

function ImgObserver (root) {
  if (!(this instanceof ImgObserver)) return new ImgObserver(root)
  this._root = root || document.body
  if (!(this._root instanceof window.Node)) throw new Error('root must be a Node https://developer.mozilla.org/en-US/docs/Web/API/Node')
  var tagName = 'IMG'
  var self = this

  // If the browser does not support MutationObserver, returns `undefined`
  var MutationObserver = window.MutationObserver
  if (!MutationObserver) return

  // Create a new observer
  this._observer = new MutationObserver(function (mutations) {
    var imgMutations = processMutations(mutations, tagName)
    // If any matching nodes were added or removed, emit an event
    // with an array of the nodes.
    if (imgMutations.addedNodes.length) self.emit('added', imgMutations.addedNodes)
    if (imgMutations.removedNodes.length) self.emit('removed', imgMutations.removedNodes)
    if (imgMutations.changedNodes.length) self.emit('changed', imgMutations.changedNodes)
  })
  this.connect(this._root)
  EventEmitter.call(this)
}

inherits(ImgObserver, EventEmitter)

ImgObserver.prototype.disconnect = function () {
  this._observer.disconnect()
}

ImgObserver.prototype.connect = function (root) {
  root = root || this._root
  this._observer.observe(root, mutationObserverInitOptions)
}

var processMutations = ImgObserver._processMutations = function (mutations, tagName) {
  var nodesById = {added: {}, removed: {}, changed: {}}

  // The mutations observer can be called with several mutations at a time
  mutations.forEach(function (mutation) {
    if (mutation.type === 'attributes') {
      if (mutation.oldValue !== mutation.target.src) {
        nodesById.changed[id(mutation.target)] = mutation.target
      }
      return
    }
    // Check whether any added nodes are an IMG tag, and if so
    // add them to the list of added nodes, and delete them from
    // the list of removed nodes.
    filterNodeList(mutation.addedNodes, tagName).forEach(function (node) {
      nodesById.added[id(node)] = node
      delete nodesById.removed[id(node)]
    })
    // Similarly check the removed IMG tags
    filterNodeList(mutation.removedNodes, tagName).forEach(function (node) {
      nodesById.removed[id(node)] = node
      delete nodesById.added[id(node)]
      delete nodesById.changed[id(node)]
    })
  })

  var changedNodes = Object.keys(nodesById.changed).map(function (id) {
    return nodesById.changed[id]
  })
  var addedNodes = Object.keys(nodesById.added).map(function (id) {
    return nodesById.added[id]
  })
  var removedNodes = Object.keys(nodesById.removed).map(function (id) {
    return nodesById.removed[id]
  })
  return {
    addedNodes: addedNodes,
    changedNodes: changedNodes,
    removedNodes: removedNodes
  }
}

/**
 * For a given nodeList filter nodes with `tagName` or children with `tagName`
 * @param {NodeList} nodeList
 * @param {string} tagName  tag to match
 * @return {array} Array of matched nodes
 */
var filterNodeList = ImgObserver._filterNodeList = function (nodeList, tagName) {
  var matched = []
  for (var i = 0; i < nodeList.length; ++i) {
    // Only check node nodes, not text or script nodes.
    if (nodeList[i].nodeType !== window.Node.ELEMENT_NODE) continue
    // Check if the root node is what we are looking for
    if (nodeList[i].tagName === tagName) {
      matched.push(nodeList[i])
      // If the node has no children, continue to next node
      if (!nodeList[i].children.length) continue
    }

    // Check for any children
    var children = nodeList[i].getElementsByTagName(tagName)
    for (var j = 0; j < children.length; ++j) {
      matched.push(children[j])
    }
  }
  return matched
}

module.exports = ImgObserver
