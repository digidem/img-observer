var test = require('prova')
var EventEmitter = require('events')
var ImgObserver = require('./')

var d = document

function cleanup (observer, nodes) {
  observer.disconnect()
  observer.removeAllListeners()
  if (!nodes) return
  if (nodes instanceof window.Node) {
    nodes = [nodes]
  }
  nodes.forEach(function (node) {
    d.body.removeChild(node)
  })
}

test('constructor', function (t) {
  var observer = ImgObserver()
  t.true(observer instanceof ImgObserver, 'creates instance of ImgObserver')
  t.true(observer instanceof EventEmitter, 'instance of EventEmitter')
  t.equal(observer._root, d.body, 'default root document.body')
  t.true(observer._observer, window.MutationObserver, 'creates an observer (instance of MutationObserver)')
  t.throws(ImgObserver.bind(null, 'not a node'), 'throws if created with a non-Node')
  cleanup(observer)
  t.end()
})

test('add & remove single img tag top-level', function (t) {
  t.plan(3)
  var observer = ImgObserver()
  var img = d.createElement('img')

  observer.on('added', function (imgs) {
    t.equal(imgs.length, 1, 'single mutation passed')
    t.equal(imgs[0], img, 'node matches img element added')
  })
  observer.on('removed', function (imgs) {
    t.equal(imgs[0], img, 'node matches img element added')
  })
  d.body.appendChild(img)
  setTimeout(function () { d.body.removeChild(img) }, 0)
  t.once('end', cleanup.bind(null, observer))
})

test('add multiple img tags top-level', function (t) {
  t.plan(3)
  var observer = ImgObserver()
  var imgNodes = []
  var documentFragment = d.createDocumentFragment()
  for (var i = 0; i < 3; i++) {
    imgNodes[i] = documentFragment.appendChild(d.createElement('img'))
  }

  observer.on('added', function (imgs) {
    t.equal(imgs.length, imgNodes.length, 'expected number of added nodes')
    t.deepEqual(imgs, imgNodes, 'added nodes match')
  })
  observer.on('removed', function (imgs) {
    t.deepEqual(imgs, imgNodes, 'added nodes match')
  })
  d.body.appendChild(documentFragment)
  setTimeout(function () {
    imgNodes.forEach(function (node) {
      d.body.removeChild(node)
    })
  }, 0)
  t.once('end', cleanup.bind(null, observer))
})

test('add img tags as children in new element', function (t) {
  t.plan(3)
  var observer = ImgObserver()
  var imgNodes = []
  var div = d.createDocumentFragment().appendChild(d.createElement('div'))
  for (var i = 0; i < 3; i++) {
    imgNodes[i] = div.appendChild(d.createElement('img'))
  }

  observer.on('added', function (imgs) {
    t.equal(imgs.length, imgNodes.length, 'expected number of added nodes')
    t.deepEqual(imgs, imgNodes, 'added nodes match')
  })
  observer.on('removed', function (imgs) {
    t.deepEqual(imgs, imgNodes, 'removed nodes match')
  })
  d.body.appendChild(div)
  setTimeout(function () { d.body.removeChild(div) }, 0)
  t.once('end', cleanup.bind(null, observer))
})

test('add img tags as children to existing element', function (t) {
  t.plan(3)
  var observer = ImgObserver()
  var imgNodes = []
  var div = d.body.appendChild(d.createElement('div'))
  var documentFragment = d.createDocumentFragment()
  for (var i = 0; i < 3; i++) {
    imgNodes[i] = documentFragment.appendChild(d.createElement('img'))
  }

  observer.on('added', function (imgs) {
    t.equal(imgs.length, imgNodes.length, 'expected number of added nodes')
    t.deepEqual(imgs, imgNodes, 'added nodes match')
  })
  observer.on('removed', function (imgs) {
    t.deepEqual(imgs, imgNodes, 'added nodes match')
  })
  div.appendChild(documentFragment)
  setTimeout(function () { d.body.removeChild(div) }, 0)
  t.once('end', cleanup.bind(null, observer))
})

test('deep nested img tags on different levels', function (t) {
  t.plan(3)
  var observer = ImgObserver()
  var imgNodes = []
  var div = d.createDocumentFragment().appendChild(d.createElement('div'))
  imgNodes[0] = div.appendChild(d.createElement('img'))
  var div2 = div.appendChild(d.createElement('div'))
  imgNodes[1] = div2.appendChild(d.createElement('img'))
  var div3 = div.appendChild(d.createElement('div'))
  imgNodes[2] = div3.appendChild(d.createElement('img'))

  observer.on('added', function (imgs) {
    t.equal(imgs.length, imgNodes.length, 'expected number of added nodes')
    t.deepEqual(imgs, imgNodes, 'added nodes match')
  })
  observer.on('removed', function (imgs) {
    t.deepEqual(imgs, imgNodes, 'added nodes match')
  })
  d.body.appendChild(div)
  setTimeout(function () { d.body.removeChild(div) }, 0)
  t.once('end', cleanup.bind(null, observer))
})

test('delayed appending multiple', function (t) {
  t.plan(6)
  var observer = ImgObserver()
  var imgNodes = []
  var div = d.body.appendChild(d.createElement('div'))
  for (var i = 0; i < 3; i++) {
    window.setTimeout(function (i) {
      imgNodes[i] = div.appendChild(d.createElement('img'))
    }.bind(null, i), (i + 1) * 30)
    window.setTimeout(function (i) {
      div.removeChild(imgNodes[i])
    }.bind(null, i), (i + 4) * 30)
  }

  observer.on('added', function (imgs) {
    imgs.forEach(function (img) {
      var i = imgNodes.indexOf(img)
      t.notEqual(i, -1, 'img tag as expected')
    })
  })
  observer.on('removed', function (imgs) {
    imgs.forEach(function (img) {
      var i = imgNodes.indexOf(img)
      t.notEqual(i, -1, 'img tag as expected')
    })
  })
  t.once('end', cleanup.bind(null, observer))
})

test('src changes', function (t) {
  t.plan(1)
  var observer = ImgObserver()
  var img = d.body.appendChild(d.createElement('img'))
  observer.on('changed', function (imgs) {
    t.equal(imgs[0], img, 'changing src triggers changed event')
  })
  img.src = 'test.jpg'
  t.once('end', cleanup.bind(null, observer, img))
})

test('multiple src changes', function (t) {
  t.plan(1)
  var observer = ImgObserver()
  var imgNodes = []
  for (var i = 0; i < 3; i++) {
    imgNodes[i] = d.body.appendChild(d.createElement('img'))
  }
  observer.on('changed', function (imgs) {
    t.deepEqual(imgs, imgNodes, 'changing src triggers changed event')
  })
  for (i = 0; i < 3; i++) {
    imgNodes[i].src = 'test.jpg'
  }
  t.once('end', cleanup.bind(null, observer, imgNodes))
})

test('deep src changes', function (t) {
  t.plan(1)
  var observer = ImgObserver()
  var div = d.body.appendChild(d.createElement('div'))
  var img = div.appendChild(d.createElement('img'))
  observer.on('changed', function (imgs) {
    t.equal(imgs[0], img, 'changing src triggers changed event')
  })
  img.src = 'test.jpg'
  t.once('end', cleanup.bind(null, observer, div))
})
