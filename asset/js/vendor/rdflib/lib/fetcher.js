"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global $SolidTestEnvironment */

/**
 *
 * Project: rdflib.js
 *
 * @file: fetcher.js
 *
 * Description: contains functions for requesting/fetching/retracting
 *  This implements quite a lot of the web architecture.
 * A fetcher is bound to a specific quad store, into which
 * it loads stuff and into which it writes its metadata
 * @@ The metadata could be optionally a separate graph
 *
 * - implements semantics of HTTP headers, Internet Content Types
 * - selects parsers for rdf/xml, n3, rdfa, grddl
 *
 * TO do:
 * - Implement a runtime registry for parsers and serializers
 * -
 */

/**
 * Things to test: callbacks on request, refresh, retract
 *   loading from HTTP, HTTPS, FTP, FILE, others?
 * To do:
 * Firing up a mail client for mid:  (message:) URLs
 */
var IndexedFormula = require('./store');

var log = require('./log');

var N3Parser = require('./n3parser');

var NamedNode = require('./named-node');

var Namespace = require('./namespace');

var rdfParse = require('./parse');

var parseRDFaDOM = require('./rdfaparser').parseRDFaDOM;

var RDFParser = require('./rdfxmlparser');

var Uri = require('./uri');

var Util = require('./util');

var serialize = require('./serialize'); // This is a special fetch withich does OIDC auth, catching 401 errors


var auth = require('solid-auth-client');

var fetch = auth ? auth.fetch : function (a, b) {
  return window.fetch(a, b);
};
var Parsable = {
  'text/n3': true,
  'text/turtle': true,
  'application/rdf+xml': true,
  'application/xhtml+xml': true,
  'text/html': true,
  'application/ld+json': true // This is a minimal set to allow the use of damaged servers if necessary

};
var CONTENT_TYPE_BY_EXT = {
  'rdf': 'application/rdf+xml',
  'owl': 'application/rdf+xml',
  'n3': 'text/n3',
  'ttl': 'text/turtle',
  'nt': 'text/n3',
  'acl': 'text/n3',
  'html': 'text/html',
  'xml': 'text/xml' // Convenience namespaces needed in this module.
  // These are deliberately not exported as the user application should
  // make its own list and not rely on the prefixes used here,
  // and not be tempted to add to them, and them clash with those of another
  // application.

};
var ns = {
  link: Namespace('http://www.w3.org/2007/ont/link#'),
  http: Namespace('http://www.w3.org/2007/ont/http#'),
  httph: Namespace('http://www.w3.org/2007/ont/httph#'),
  // headers
  rdf: Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  rdfs: Namespace('http://www.w3.org/2000/01/rdf-schema#'),
  dc: Namespace('http://purl.org/dc/elements/1.1/'),
  ldp: Namespace('http://www.w3.org/ns/ldp#')
};

var Handler = function Handler(response, dom) {
  _classCallCheck(this, Handler);

  this.response = response;
  this.dom = dom;
};

var RDFXMLHandler =
/*#__PURE__*/
function (_Handler) {
  _inherits(RDFXMLHandler, _Handler);

  function RDFXMLHandler() {
    _classCallCheck(this, RDFXMLHandler);

    return _possibleConstructorReturn(this, _getPrototypeOf(RDFXMLHandler).apply(this, arguments));
  }

  _createClass(RDFXMLHandler, [{
    key: "parse",
    value: function parse(fetcher, responseText, options, response) {
      var kb = fetcher.store;

      if (!this.dom) {
        this.dom = Util.parseXML(responseText);
      }

      var root = this.dom.documentElement;

      if (root.nodeName === 'parsererror') {
        // Mozilla only See issue/issue110
        // have to fail the request
        return fetcher.failFetch(options, 'Badly formed XML in ' + options.resource.uri, 'parse_error');
      }

      var parser = new RDFParser(kb);

      try {
        parser.parse(this.dom, options.original.uri, options.original, response);
      } catch (err) {
        return fetcher.failFetch(options, 'Syntax error parsing RDF/XML! ' + err, 'parse_error');
      }

      if (!options.noMeta) {
        kb.add(options.original, ns.rdf('type'), ns.link('RDFDocument'), fetcher.appNode);
      }

      return fetcher.doneFetch(options, this.response);
    }
  }], [{
    key: "toString",
    value: function toString() {
      return 'RDFXMLHandler';
    }
  }, {
    key: "register",
    value: function register(fetcher) {
      fetcher.mediatypes['application/rdf+xml'] = {
        'q': 0.9
      };
    }
  }]);

  return RDFXMLHandler;
}(Handler);

RDFXMLHandler.pattern = new RegExp('application/rdf\\+xml');

var XHTMLHandler =
/*#__PURE__*/
function (_Handler2) {
  _inherits(XHTMLHandler, _Handler2);

  function XHTMLHandler() {
    _classCallCheck(this, XHTMLHandler);

    return _possibleConstructorReturn(this, _getPrototypeOf(XHTMLHandler).apply(this, arguments));
  }

  _createClass(XHTMLHandler, [{
    key: "parse",
    value: function parse(fetcher, responseText, options, response) {
      var relation, reverse;

      if (!this.dom) {
        this.dom = Util.parseXML(responseText);
      }

      var kb = fetcher.store; // dc:title

      var title = this.dom.getElementsByTagName('title');

      if (title.length > 0) {
        kb.add(options.resource, ns.dc('title'), kb.literal(title[0].textContent), options.resource); // log.info("Inferring title of " + xhr.resource)
      } // link rel


      var links = this.dom.getElementsByTagName('link');

      for (var x = links.length - 1; x >= 0; x--) {
        // @@ rev
        relation = links[x].getAttribute('rel');
        reverse = false;

        if (!relation) {
          relation = links[x].getAttribute('rev');
          reverse = true;
        }

        if (relation) {
          fetcher.linkData(options.original, relation, links[x].getAttribute('href'), options.resource, reverse);
        }
      } // Data Islands


      var scripts = this.dom.getElementsByTagName('script');

      for (var i = 0; i < scripts.length; i++) {
        var contentType = scripts[i].getAttribute('type');

        if (Parsable[contentType]) {
          rdfParse(scripts[i].textContent, kb, options.original.uri, contentType);
          rdfParse(scripts[i].textContent, kb, options.original.uri, contentType);
        }
      }

      if (!options.noMeta) {
        kb.add(options.resource, ns.rdf('type'), ns.link('WebPage'), fetcher.appNode);
      }

      if (!options.noRDFa && parseRDFaDOM) {
        // enable by default
        try {
          parseRDFaDOM(this.dom, kb, options.original.uri);
        } catch (err) {
          var msg = 'Error trying to parse ' + options.resource + ' as RDFa:\n' + err + ':\n' + err.stack;
          return fetcher.failFetch(options, msg, 'parse_error');
        }
      }

      return fetcher.doneFetch(options, this.response);
    }
  }], [{
    key: "toString",
    value: function toString() {
      return 'XHTMLHandler';
    }
  }, {
    key: "register",
    value: function register(fetcher) {
      fetcher.mediatypes['application/xhtml+xml'] = {};
    }
  }]);

  return XHTMLHandler;
}(Handler);

XHTMLHandler.pattern = new RegExp('application/xhtml');

var XMLHandler =
/*#__PURE__*/
function (_Handler3) {
  _inherits(XMLHandler, _Handler3);

  function XMLHandler() {
    _classCallCheck(this, XMLHandler);

    return _possibleConstructorReturn(this, _getPrototypeOf(XMLHandler).apply(this, arguments));
  }

  _createClass(XMLHandler, [{
    key: "parse",
    value: function parse(fetcher, responseText, options, response) {
      var dom = Util.parseXML(responseText); // XML Semantics defined by root element namespace
      // figure out the root element

      for (var c = 0; c < dom.childNodes.length; c++) {
        // is this node an element?
        if (dom.childNodes[c].nodeType === 1) {
          // We've found the first element, it's the root
          var _ns = dom.childNodes[c].namespaceURI; // Is it RDF/XML?

          if (_ns && _ns === _ns['rdf']) {
            fetcher.addStatus(options.req, 'Has XML root element in the RDF namespace, so assume RDF/XML.');
            var rdfHandler = new RDFXMLHandler(this.response, dom);
            return rdfHandler.parse(fetcher, responseText, options, response);
          }

          break;
        }
      } // Or it could be XHTML?
      // Maybe it has an XHTML DOCTYPE?


      if (dom.doctype) {
        // log.info("We found a DOCTYPE in " + xhr.resource)
        if (dom.doctype.name === 'html' && dom.doctype.publicId.match(/^-\/\/W3C\/\/DTD XHTML/) && dom.doctype.systemId.match(/http:\/\/www.w3.org\/TR\/xhtml/)) {
          fetcher.addStatus(options.req, 'Has XHTML DOCTYPE. Switching to XHTML Handler.\n');
          var xhtmlHandler = new XHTMLHandler(this.response, dom);
          return xhtmlHandler.parse(fetcher, responseText, options, response);
        }
      } // Or what about an XHTML namespace?


      var html = dom.getElementsByTagName('html')[0];

      if (html) {
        var xmlns = html.getAttribute('xmlns');

        if (xmlns && xmlns.match(/^http:\/\/www.w3.org\/1999\/xhtml/)) {
          fetcher.addStatus(options.req, 'Has a default namespace for ' + 'XHTML. Switching to XHTMLHandler.\n');

          var _xhtmlHandler = new XHTMLHandler(this.response, dom);

          return _xhtmlHandler.parse(fetcher, responseText, options, response);
        }
      } // At this point we should check the namespace document (cache it!) and
      // look for a GRDDL transform
      // @@  Get namespace document <n>, parse it, look for  <n> grddl:namespaceTransform ?y
      // Apply ?y to   dom
      // We give up. What dialect is this?


      return fetcher.failFetch(options, 'Unsupported dialect of XML: not RDF or XHTML namespace, etc.\n' + responseText.slice(0, 80), 901);
    }
  }], [{
    key: "toString",
    value: function toString() {
      return 'XMLHandler';
    }
  }, {
    key: "register",
    value: function register(fetcher) {
      fetcher.mediatypes['text/xml'] = {
        'q': 0.5
      };
      fetcher.mediatypes['application/xml'] = {
        'q': 0.5
      };
    }
  }]);

  return XMLHandler;
}(Handler);

XMLHandler.pattern = new RegExp('(text|application)/(.*)xml');

var HTMLHandler =
/*#__PURE__*/
function (_Handler4) {
  _inherits(HTMLHandler, _Handler4);

  function HTMLHandler() {
    _classCallCheck(this, HTMLHandler);

    return _possibleConstructorReturn(this, _getPrototypeOf(HTMLHandler).apply(this, arguments));
  }

  _createClass(HTMLHandler, [{
    key: "parse",
    value: function parse(fetcher, responseText, options, response) {
      var kb = fetcher.store; // We only handle XHTML so we have to figure out if this is XML
      // log.info("Sniffing HTML " + xhr.resource + " for XHTML.")

      if (responseText.match(/\s*<\?xml\s+version\s*=[^<>]+\?>/)) {
        fetcher.addStatus(options.req, "Has an XML declaration. We'll assume " + "it's XHTML as the content-type was text/html.\n");
        var xhtmlHandler = new XHTMLHandler(this.response);
        return xhtmlHandler.parse(fetcher, responseText, options, response);
      } // DOCTYPE
      // There is probably a smarter way to do this


      if (responseText.match(/.*<!DOCTYPE\s+html[^<]+-\/\/W3C\/\/DTD XHTML[^<]+http:\/\/www.w3.org\/TR\/xhtml[^<]+>/)) {
        fetcher.addStatus(options.req, 'Has XHTML DOCTYPE. Switching to XHTMLHandler.\n');

        var _xhtmlHandler2 = new XHTMLHandler(this.response);

        return _xhtmlHandler2.parse(fetcher, responseText, options, response);
      } // xmlns


      if (responseText.match(/[^(<html)]*<html\s+[^<]*xmlns=['"]http:\/\/www.w3.org\/1999\/xhtml["'][^<]*>/)) {
        fetcher.addStatus(options.req, 'Has default namespace for XHTML, so switching to XHTMLHandler.\n');

        var _xhtmlHandler3 = new XHTMLHandler(this.response);

        return _xhtmlHandler3.parse(fetcher, responseText, options, response);
      } // dc:title
      // no need to escape '/' here


      var titleMatch = new RegExp('<title>([\\s\\S]+?)</title>', 'im').exec(responseText);

      if (titleMatch) {
        kb.add(options.resource, ns.dc('title'), kb.literal(titleMatch[1]), options.resource); // think about xml:lang later
      }

      kb.add(options.resource, ns.rdf('type'), ns.link('WebPage'), fetcher.appNode);
      fetcher.addStatus(options.req, 'non-XML HTML document, not parsed for data.');
      return fetcher.doneFetch(options, this.response);
    }
  }], [{
    key: "toString",
    value: function toString() {
      return 'HTMLHandler';
    }
  }, {
    key: "register",
    value: function register(fetcher) {
      fetcher.mediatypes['text/html'] = {
        'q': 0.9
      };
    }
  }]);

  return HTMLHandler;
}(Handler);

HTMLHandler.pattern = new RegExp('text/html');

var TextHandler =
/*#__PURE__*/
function (_Handler5) {
  _inherits(TextHandler, _Handler5);

  function TextHandler() {
    _classCallCheck(this, TextHandler);

    return _possibleConstructorReturn(this, _getPrototypeOf(TextHandler).apply(this, arguments));
  }

  _createClass(TextHandler, [{
    key: "parse",
    value: function parse(fetcher, responseText, options, response) {
      // We only speak dialects of XML right now. Is this XML?
      // Look for an XML declaration
      if (responseText.match(/\s*<\?xml\s+version\s*=[^<>]+\?>/)) {
        fetcher.addStatus(options.req, 'Warning: ' + options.resource + " has an XML declaration. We'll assume " + "it's XML but its content-type wasn't XML.\n");
        var xmlHandler = new XMLHandler(this.response);
        return xmlHandler.parse(fetcher, responseText, options, response);
      } // Look for an XML declaration


      if (responseText.slice(0, 500).match(/xmlns:/)) {
        fetcher.addStatus(options.req, "May have an XML namespace. We'll assume " + "it's XML but its content-type wasn't XML.\n");

        var _xmlHandler = new XMLHandler(this.response);

        return _xmlHandler.parse(fetcher, responseText, options, response);
      } // We give up finding semantics - this is not an error, just no data


      fetcher.addStatus(options.req, 'Plain text document, no known RDF semantics.');
      return fetcher.doneFetch(options, this.response);
    }
  }], [{
    key: "toString",
    value: function toString() {
      return 'TextHandler';
    }
  }, {
    key: "register",
    value: function register(fetcher) {
      fetcher.mediatypes['text/plain'] = {
        'q': 0.5
      };
    }
  }]);

  return TextHandler;
}(Handler);

TextHandler.pattern = new RegExp('text/plain');

var N3Handler =
/*#__PURE__*/
function (_Handler6) {
  _inherits(N3Handler, _Handler6);

  function N3Handler() {
    _classCallCheck(this, N3Handler);

    return _possibleConstructorReturn(this, _getPrototypeOf(N3Handler).apply(this, arguments));
  }

  _createClass(N3Handler, [{
    key: "parse",
    value: function parse(fetcher, responseText, options, response) {
      // Parse the text of this N3 file
      var kb = fetcher.store;
      var p = N3Parser(kb, kb, options.original.uri, options.original.uri, null, null, '', null); //                p.loadBuf(xhr.responseText)

      try {
        p.loadBuf(responseText);
      } catch (err) {
        var msg = 'Error trying to parse ' + options.resource + ' as Notation3:\n' + err; // not err.stack -- irrelevant

        return fetcher.failFetch(options, msg, 'parse_error', response);
      }

      fetcher.addStatus(options.req, 'N3 parsed: ' + p.statementCount + ' triples in ' + p.lines + ' lines.');
      fetcher.store.add(options.original, ns.rdf('type'), ns.link('RDFDocument'), fetcher.appNode);
      return fetcher.doneFetch(options, this.response);
    }
  }], [{
    key: "toString",
    value: function toString() {
      return 'N3Handler';
    }
  }, {
    key: "register",
    value: function register(fetcher) {
      fetcher.mediatypes['text/n3'] = {
        'q': '1.0' // as per 2008 spec

        /*
         fetcher.mediatypes['application/x-turtle'] = {
         'q': 1.0
         } // pre 2008
         */

      };
      fetcher.mediatypes['text/turtle'] = {
        'q': 1.0 // post 2008

      };
    }
  }]);

  return N3Handler;
}(Handler);

N3Handler.pattern = new RegExp('(application|text)/(x-)?(rdf\\+)?(n3|turtle)');
var HANDLERS = {
  RDFXMLHandler: RDFXMLHandler,
  XHTMLHandler: XHTMLHandler,
  XMLHandler: XMLHandler,
  HTMLHandler: HTMLHandler,
  TextHandler: TextHandler,
  N3Handler: N3Handler
  /** Fetcher
   *
   * The Fetcher object is a helper object for a quadstore
   * which turns it from an offline store to an online store.
   * The fetcher deals with loading data files rom the web,
    * figuring how to parse them.  It will also refresh, remove, the data
    * and put back the fata to the web.
   */

};

var Fetcher =
/*#__PURE__*/
function () {
  /**
  * @constructor
  */
  function Fetcher(store) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Fetcher);

    this.store = store || new IndexedFormula();
    this.timeout = options.timeout || 30000;
    this._fetch = options.fetch || fetch;

    if (!this._fetch) {
      throw new Error('No _fetch function availble for Fetcher');
    }

    this.appNode = this.store.bnode(); // Denoting this session

    this.store.fetcher = this; // Bi-linked

    this.requested = {}; // this.requested[uri] states:
    //   undefined     no record of web access or records reset
    //   true          has been requested, fetch in progress
    //   'done'        received, Ok
    //   401           Not logged in
    //   403           HTTP status unauthorized
    //   404           Resource does not exist. Can be created etc.
    //   'redirected'  In attempt to counter CORS problems retried.
    //   'parse_error' Parse error
    //   'unsupported_protocol'  URI is not a protocol Fetcher can deal with
    //   other strings mean various other errors.
    //

    this.timeouts = {}; // list of timeouts associated with a requested URL

    this.redirectedTo = {}; // When 'redirected'

    this.fetchQueue = {};
    this.fetchCallbacks = {}; // fetchCallbacks[uri].push(callback)

    this.nonexistent = {}; // keep track of explicit 404s -> we can overwrite etc

    this.lookedUp = {};
    this.handlers = [];
    this.mediatypes = {
      'image/*': {
        'q': 0.9
      },
      '*/*': {
        'q': 0.1 // Must allow access to random content

      } // Util.callbackify(this, ['request', 'recv', 'headers', 'load', 'fail',
      //   'refresh', 'retract', 'done'])
      // In switching to fetch(), 'recv', 'headers' and 'load' do not make sense

    };
    Util.callbackify(this, ['request', 'fail', 'refresh', 'retract', 'done']);
    Object.keys(HANDLERS).map(function (key) {
      return _this.addHandler(HANDLERS[key]);
    });
  }

  _createClass(Fetcher, [{
    key: "load",

    /**
     * Promise-based load function
     *
     * Loads a web resource or resources into the store.
     *
     * A resource may be given as NamedNode object, or as a plain URI.
     * an arrsy of resources will be given, in which they will be fetched in parallel.
     * By default, the HTTP headers are recorded also, in the same store, in a separate graph.
     * This allows code like editable() for example to test things about the resource.
     *
     * @param uri {Array<NamedNode>|Array<string>|NamedNode|string}
     *
     * @param [options={}] {Object}
     *
     * @param [options.fetch] {Function}
     *
     * @param [options.referringTerm] {NamedNode} Referring term, the resource which
     *   referred to this (for tracking bad links)
     *
     * @param [options.contentType] {string} Provided content type (for writes)
     *
     * @param [options.forceContentType] {string} Override the incoming header to
     *   force the data to be treated as this content-type (for reads)
     *
     * @param [options.force] {boolean} Load the data even if loaded before.
     *   Also sets the `Cache-Control:` header to `no-cache`
     *
     * @param [options.baseURI=docuri] {Node|string} Original uri to preserve
     *   through proxying etc (`xhr.original`).
     *
     * @param [options.proxyUsed] {boolean} Whether this request is a retry via
     *   a proxy (generally done from an error handler)
     *
     * @param [options.withCredentials] {boolean} flag for XHR/CORS etc
     *
     * @param [options.clearPreviousData] {boolean} Before we parse new data,
     *   clear old, but only on status 200 responses
     *
     * @param [options.noMeta] {boolean} Prevents the addition of various metadata
     *   triples (about the fetch request) to the store
     *
     * @param [options.noRDFa] {boolean}
     *
     * @returns {Promise<Result>}
     */
    value: function load(uri) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (uri instanceof Array) {
        return Promise.all(uri.map(function (x) {
          return _this2.load(x, Object.assign({}, options));
        }));
      }

      var docuri = uri.uri || uri;
      docuri = docuri.split('#')[0];
      options = this.initFetchOptions(docuri, options);
      return this.pendingFetchPromise(docuri, options.baseURI, options);
    }
    /**
     * @param uri {string}
     * @param originalUri {string}
     * @param options {Object}
     * @returns {Promise<Result>}
     */

  }, {
    key: "pendingFetchPromise",
    value: function pendingFetchPromise(uri, originalUri, options) {
      var _this3 = this;

      var pendingPromise; // Check to see if some request is already dealing with this uri

      if (!options.force && this.fetchQueue[originalUri]) {
        pendingPromise = this.fetchQueue[originalUri];
      } else {
        pendingPromise = Promise.race([this.setRequestTimeout(uri, options), this.fetchUri(uri, options)]);
        this.fetchQueue[originalUri] = pendingPromise; // Clean up the queued promise after a time, if it's resolved

        this.cleanupFetchRequest(originalUri, options, this.timeout);
      }

      return pendingPromise.then(function (x) {
        if (uri in _this3.timeouts) {
          _this3.timeouts[uri].forEach(clearTimeout);

          delete _this3.timeouts[uri];
        }

        return x;
      });
    }
  }, {
    key: "cleanupFetchRequest",
    value: function cleanupFetchRequest(originalUri, options, timeout) {
      var _this4 = this;

      this.timeouts[originalUri] = (this.timeouts[originalUri] || []).concat(setTimeout(function () {
        if (!_this4.isPending(originalUri)) {
          delete _this4.fetchQueue[originalUri];
        }
      }, timeout));
    }
    /**
     * @param uri {string}
     * @param options {Object}
     *
     * @returns {Object}
     */

  }, {
    key: "initFetchOptions",
    value: function initFetchOptions(uri, options) {
      var kb = this.store;
      var isGet = !options.method || options.method.toUpperCase() === 'GET';

      if (!isGet) {
        options.force = true;
      }

      options.resource = kb.sym(uri); // This might be proxified

      options.baseURI = options.baseURI || uri; // Preserve though proxying etc

      options.original = kb.sym(options.baseURI);
      options.req = kb.bnode();
      options.headers = options.headers || {};

      if (options.contentType) {
        options.headers['content-type'] = options.contentType;
      }

      if (options.force) {
        options.cache = 'no-cache';
      }

      var acceptString = this.acceptString();
      options.headers['accept'] = acceptString;
      var requestedURI = Fetcher.offlineOverride(uri);
      options.requestedURI = requestedURI;

      if (Fetcher.withCredentials(requestedURI, options)) {
        options.credentials = 'include';
      }

      var actualProxyURI = Fetcher.proxyIfNecessary(requestedURI);

      if (requestedURI !== actualProxyURI) {
        options.proxyUsed = true;
      }

      options.actualProxyURI = actualProxyURI;
      return options;
    }
    /**
     * (The promise chain ends in either a `failFetch()` or a `doneFetch()`)
     *
     * @param docuri {string}
     * @param options {Object}
     *
     * @returns {Promise<Object>} fetch() result or an { error, status } object
     */

  }, {
    key: "fetchUri",
    value: function fetchUri(docuri, options) {
      var _this5 = this;

      if (!docuri) {
        return Promise.reject(new Error('Cannot fetch an empty uri'));
      }

      if (Fetcher.unsupportedProtocol(docuri)) {
        return this.failFetch(options, 'fetcher: Unsupported protocol', 'unsupported_protocol');
      }

      var state = this.getState(docuri);

      if (!options.force) {
        if (state === 'fetched') {
          // URI already fetched and added to store
          return Promise.resolve(this.doneFetch(options, {
            status: 200,
            ok: true,
            statusText: 'Already loaded into quadstore.'
          }));
        }

        if (state === 'failed' && this.requested[docuri] === 404) {
          // Remember nonexistence
          var message = 'Previously failed: ' + this.requested[docuri];
          var dummyResponse = {
            url: docuri,
            status: this.requested[docuri],
            statusText: message,
            responseText: message,
            headers: {},
            // Headers() ???
            ok: false,
            body: null,
            bodyUsed: false,
            size: 0,
            timeout: 0
          };
          return this.failFetch(options, message, this.requested[docuri], dummyResponse);
        }
      } else {
        // options.force == true
        delete this.nonexistent[docuri];
      }

      this.fireCallbacks('request', [docuri]);
      this.requested[docuri] = true; // mark this uri as 'requested'

      if (!options.noMeta) {
        this.saveRequestMetadata(docuri, options);
      }

      var actualProxyURI = options.actualProxyURI;
      return this._fetch(actualProxyURI, options).then(function (response) {
        return _this5.handleResponse(response, docuri, options);
      }, function (error) {
        var dummyResponse = {
          url: actualProxyURI,
          status: 999,
          // @@ what number/string should fetch failures report?
          statusText: (error.name || 'network failure') + ': ' + (error.errno || error.code || error.type),
          responseText: error.message,
          headers: {},
          // Headers() ???
          ok: false,
          body: null,
          bodyUsed: false,
          size: 0,
          timeout: 0
        };
        console.log('Fetcher: <' + actualProxyURI + '> Non-HTTP fetch error: ' + error);
        return _this5.failFetch(options, 'fetch failed: ' + error, 999, dummyResponse); // Fake status code: fetch exception
        // handleError expects a response so we fake some important bits.

        /*
        this.handleError(, docuri, options)
        */
      });
    }
    /**
     * Asks for a doc to be loaded if necessary then calls back
     *
     * Calling methods:
     *   nowOrWhenFetched (uri, userCallback)
     *   nowOrWhenFetched (uri, options, userCallback)
     *   nowOrWhenFetched (uri, referringTerm, userCallback, options)  <-- old
     *   nowOrWhenFetched (uri, referringTerm, userCallback) <-- old
     *
     *  Options include:
     *   referringTerm    The document in which this link was found.
     *                    this is valuable when finding the source of bad URIs
     *   force            boolean.  Never mind whether you have tried before,
     *                    load this from scratch.
     *   forceContentType Override the incoming header to force the data to be
     *                    treated as this content-type.
     *
     *  Callback function takes:
     *
     *    ok               True if the fetch worked, and got a 200 response.
     *                     False if any error happened
     *
     *    errmessage       Text error message if not OK.
     *
     *    response         The fetch Response object (was: XHR) if there was was one
     *                     includes response.status as the HTTP status if any.
     */

  }, {
    key: "nowOrWhenFetched",
    value: function nowOrWhenFetched(uri, p2, userCallback) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      uri = uri.uri || uri; // allow symbol object or string to be passed

      if (typeof p2 === 'function') {
        // nowOrWhenFetched (uri, userCallback)
        userCallback = p2;
      } else if (typeof p2 === 'undefined') {// original calling signature
        // referringTerm = undefined
      } else if (p2 instanceof NamedNode) {
        // referringTerm = p2
        options.referringTerm = p2;
      } else {
        // nowOrWhenFetched (uri, options, userCallback)
        options = p2;
      }

      this.load(uri, options).then(function (fetchResponse) {
        if (userCallback) {
          if (fetchResponse) {
            if (fetchResponse.ok) {
              userCallback(true, 'OK', fetchResponse);
            } else {
              console.log('@@@ fetcher.js Should not take this path !!!!!!!!!!!!');
              var oops = 'HTTP error: Status ' + fetchResponse.status + ' (' + fetchResponse.statusText + ')';

              if (fetchResponse.responseText) {
                oops += ' ' + fetchResponse.responseText; // not in 404, dns error, nock failure
              }

              console.log(oops + ' fetching ' + uri);
              userCallback(false, oops, fetchResponse);
            }
          } else {
            var _oops = '@@ nowOrWhenFetched:  no response object!';
            console.log(_oops);
            userCallback(false, _oops);
          }
        }
      }, function (err) {
        var message = err.message || err.statusText;
        message = 'Failed to load  <' + uri + '> ' + message;
        console.log(message);

        if (err.response && err.response.status) {
          message += ' status: ' + err.response.status;
        }

        userCallback(false, message, err.response);
      });
    }
    /**
     * Records a status message (as a literal node) by appending it to the
     * request's metadata status collection.
     *
     * @param req {BlankNode}
     * @param statusMessage {string}
     */

  }, {
    key: "addStatus",
    value: function addStatus(req, statusMessage) {
      // <Debug about="parsePerformance">
      var now = new Date();
      statusMessage = '[' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '.' + now.getMilliseconds() + '] ' + statusMessage; // </Debug>

      var kb = this.store;
      var statusNode = kb.the(req, ns.link('status'));

      if (statusNode && statusNode.append) {
        statusNode.append(kb.literal(statusMessage));
      } else {
        log.warn('web.js: No list to add to: ' + statusNode + ',' + statusMessage);
      }
    }
    /**
     * Records errors in the system on failure:
     *
     *  - Adds an entry to the request status collection
     *  - Adds an error triple with the fail message to the metadata
     *  - Fires the 'fail' callback
     *  - Rejects with an error result object, which has a response object if any
     *
     * @param options {Object}
     * @param errorMessage {string}
     * @param statusCode {number}
     * @param response {Response}  // when an fetch() error
     *
     * @returns {Promise<Object>}
     */

  }, {
    key: "failFetch",
    value: function failFetch(options, errorMessage, statusCode, response) {
      this.addStatus(options.req, errorMessage);

      if (!options.noMeta) {
        this.store.add(options.original, ns.link('error'), errorMessage);
      }

      var meth = (options.method || 'GET').toUpperCase();
      var isGet = meth === 'GET' || meth === 'HEAD';

      if (isGet) {
        // only cache the status code on GET or HEAD
        if (!options.resource.sameTerm(options.original)) {
          console.log('@@ Recording failure  ' + meth + '  original ' + options.original + '( as ' + options.resource + ') : ' + statusCode);
        } else {
          console.log('@@ Recording ' + meth + ' failure for ' + options.original + ': ' + statusCode);
        }

        this.requested[Uri.docpart(options.original.uri)] = statusCode;
        this.fireCallbacks('fail', [options.original.uri, errorMessage]);
      }

      var err = new Error('Fetcher: ' + errorMessage); // err.ok = false // Is taken as a response, will work too @@ phase out?

      err.status = statusCode;
      err.statusText = errorMessage;
      err.response = response;
      return Promise.reject(err);
    } // in the why part of the quad distinguish between HTML and HTTP header
    // Reverse is set iif the link was rev= as opposed to rel=

  }, {
    key: "linkData",
    value: function linkData(originalUri, rel, uri, why, reverse) {
      if (!uri) return;
      var kb = this.store;
      var predicate; // See http://www.w3.org/TR/powder-dr/#httplink for describedby 2008-12-10

      var obj = kb.sym(Uri.join(uri, originalUri.uri));

      if (rel === 'alternate' || rel === 'seeAlso' || rel === 'meta' || rel === 'describedby') {
        if (obj.uri === originalUri.uri) {
          return;
        }

        predicate = ns.rdfs('seeAlso');
      } else if (rel === 'type') {
        predicate = kb.sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
      } else {
        // See https://www.iana.org/assignments/link-relations/link-relations.xml
        // Alas not yet in RDF yet for each predicate
        // encode space in e.g. rel="shortcut icon"
        predicate = kb.sym(Uri.join(encodeURIComponent(rel), 'http://www.iana.org/assignments/link-relations/'));
      }

      if (reverse) {
        kb.add(obj, predicate, originalUri, why);
      } else {
        kb.add(originalUri, predicate, obj, why);
      }
    }
  }, {
    key: "parseLinkHeader",
    value: function parseLinkHeader(linkHeader, originalUri, reqNode) {
      if (!linkHeader) {
        return;
      } // const linkexp = /<[^>]*>\s*(\s*;\s*[^()<>@,;:"/[\]?={} \t]+=(([^()<>@,;:"/[]?={} \t]+)|("[^"]*")))*(,|$)/g
      // const paramexp = /[^()<>@,;:"/[]?={} \t]+=(([^()<>@,;:"/[]?={} \t]+)|("[^"]*"))/g
      // From https://www.dcode.fr/regular-expression-simplificator:
      // const linkexp = /<[^>]*>\s*(\s*;\s*[^()<>@,;:"/[\]?={} t]+=["]))*[,$]/g
      // const paramexp = /[^\\<>@,;:"\/\[\]?={} \t]+=["])/g
      // Original:


      var linkexp = /<[^>]*>\s*(\s*;\s*[^()<>@,;:"/[\]?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*")))*(,|$)/g;
      var paramexp = /[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*"))/g;
      var matches = linkHeader.match(linkexp);

      for (var i = 0; i < matches.length; i++) {
        var split = matches[i].split('>');
        var href = split[0].substring(1);
        var ps = split[1];
        var s = ps.match(paramexp);

        for (var j = 0; j < s.length; j++) {
          var p = s[j];
          var paramsplit = p.split('='); // var name = paramsplit[0]

          var rel = paramsplit[1].replace(/["']/g, ''); // '"

          this.linkData(originalUri, rel, href, reqNode);
        }
      }
    }
  }, {
    key: "doneFetch",
    value: function doneFetch(options, response) {
      this.addStatus(options.req, 'Done.');
      this.requested[options.original.uri] = 'done';
      this.fireCallbacks('done', [options.original.uri]);
      response.req = options.req; // Set the request meta blank node

      return response;
    }
    /**
     * Note two nodes are now smushed
     * If only one was flagged as looked up, then the new node is looked up again,
     * which will make sure all the URIs are dereferenced
     */

  }, {
    key: "nowKnownAs",
    value: function nowKnownAs(was, now) {
      if (this.lookedUp[was.uri]) {
        // Transfer userCallback
        if (!this.lookedUp[now.uri]) {
          this.lookUpThing(now, was);
        }
      } else if (this.lookedUp[now.uri]) {
        if (!this.lookedUp[was.uri]) {
          this.lookUpThing(was, now);
        }
      }
    }
    /**
     * Writes back to the web what we have in the store for this uri
     *
     * @param uri {Node|string}
     * @param [options={}]
     *
     * @returns {Promise}
     */

  }, {
    key: "putBack",
    value: function putBack(uri) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      uri = uri.uri || uri; // Accept object or string

      var doc = new NamedNode(uri).doc(); // strip off #

      options.contentType = options.contentType || 'text/turtle';
      options.data = serialize(doc, this.store, doc.uri, options.contentType);
      return this.webOperation('PUT', uri, options);
    }
  }, {
    key: "webCopy",
    value: function webCopy(here, there, contentType) {
      var _this6 = this;

      return this.webOperation('GET', here).then(function (result) {
        return _this6.webOperation('PUT', // change to binary from text
        there, {
          data: result.responseText,
          contentType: contentType
        });
      });
    }
    /**
     * @param uri {string}
     * @param [options] {Object}
     *
     * @returns {Promise<Response>}
     */

  }, {
    key: "delete",
    value: function _delete(uri, options) {
      var _this7 = this;

      return this.webOperation('DELETE', uri, options).then(function (response) {
        _this7.requested[uri] = 404;
        _this7.nonexistent[uri] = true;

        _this7.unload(_this7.store.sym(uri));

        return response;
      });
    }
    /**
     * @param parentURI {string} URI of parent container
     * @param [folderName] {string} Optional folder name (slug)
     * @param [data] {string} Optional folder metadata
     *
     * @returns {Promise<Response>}
     */

  }, {
    key: "createContainer",
    value: function createContainer(parentURI, folderName, data) {
      var headers = {
        // Force the right mime type for containers
        'content-type': 'text/turtle',
        'link': ns.ldp('BasicContainer') + '; rel="type"'
      };

      if (folderName) {
        headers['slug'] = folderName;
      }

      var options = {
        headers: headers
      };

      if (data) {
        options.body = data;
      }

      return this.webOperation('POST', parentURI, options);
    }
    /**
     * A generic web opeation, at the fetch() level.
     * does not invole the quadstore.
     *
     *  Returns promise of Response
     *  If data is returned, copies it to response.responseText before returning
     *
     * @param method
     * @param uri  or NamedNode
     * @param options
     *
     * @returns {Promise<Response>}
     */

  }, {
    key: "webOperation",
    value: function webOperation(method, uri) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      uri = uri.uri || uri; // Allow a NamedNode to be passed as it is very common

      options.method = method;
      options.body = options.data || options.body;
      options.force = true;
      var fetcher = this;

      if (options.body && !options.contentType) {
        throw new Error('Web operation sending data must have a defined contentType.');
      }

      if (options.contentType) {
        options.headers = options.headers || {};
        options.headers['content-type'] = options.contentType;
      }

      if (Fetcher.withCredentials(uri, options)) {
        options.credentials = 'include'; // Otherwise coookies are not sent
      }

      return new Promise(function (resolve, reject) {
        fetcher._fetch(uri, options).then(function (response) {
          if (response.ok) {
            if (response.body) {
              response.text().then(function (data) {
                response.responseText = data;
                resolve(response);
              });
            } else {
              resolve(response);
            }
          } else {
            var msg = 'Web error: ' + response.status;
            if (response.statusText) msg += ' (' + response.statusText + ')';
            msg += ' on ' + method + ' of <' + uri + '>';
            if (response.responseText) msg += ': ' + response.responseText;
            var e2 = new Error(msg);
            e2.response = response;
            reject(e2);
          }
        }, function (err) {
          var msg = 'Fetch error for ' + method + ' of <' + uri + '>:' + err;
          reject(new Error(msg));
        });
      });
    }
    /**
     * Looks up something.
     * Looks up all the URIs a things has.
     *
     * @param term {NamedNode} canonical term for the thing whose URI is
     *   to be dereferenced
     * @param rterm {NamedNode} the resource which referred to this
     *   (for tracking bad links)
     *
     * @returns {Promise}
     */

  }, {
    key: "lookUpThing",
    value: function lookUpThing(term, rterm) {
      var _this8 = this;

      var uris = this.store.uris(term); // Get all URIs

      uris = uris.map(function (u) {
        return Uri.docpart(u);
      }); // Drop hash fragments

      uris.forEach(function (u) {
        _this8.lookedUp[u] = true;
      });
      return this.load(uris, {
        referringTerm: rterm
      });
    }
    /**
     * Looks up response header.
     *
     * @param doc
     * @param header
     *
     * @returns {Array|undefined} a list of header values found in a stored HTTP
     *   response, or [] if response was found but no header found,
     *   or undefined if no response is available.
     * Looks for { [] link:requestedURI ?uri; link:response [ httph:header-name  ?value ] }
     */

  }, {
    key: "getHeader",
    value: function getHeader(doc, header) {
      var kb = this.store;
      var requests = kb.each(undefined, ns.link('requestedURI'), doc.uri);

      for (var r = 0; r < requests.length; r++) {
        var request = requests[r];

        if (request !== undefined) {
          var response = kb.any(request, ns.link('response'));

          if (response !== undefined) {
            console.log('@@@ looking for ' + ns.httph(header.toLowerCase()));
            var results = kb.each(response, ns.httph(header.toLowerCase()));

            if (results.length) {
              return results.map(function (v) {
                return v.value;
              });
            }

            return [];
          }
        }
      }

      return undefined;
    }
    /**
     *
     * @param docuri
     * @param options
     */

  }, {
    key: "saveRequestMetadata",
    value: function saveRequestMetadata(docuri, options) {
      var req = options.req;
      var kb = this.store;
      var rterm = options.referringTerm;
      this.addStatus(options.req, 'Accept: ' + options.headers['accept']);

      if (rterm && rterm.uri) {
        kb.add(docuri, ns.link('requestedBy'), rterm.uri, this.appNode);
      }

      if (options.original && options.original.uri !== docuri) {
        kb.add(req, ns.link('orginalURI'), kb.literal(options.original.uri), this.appNode);
      }

      var now = new Date();
      var timeNow = '[' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '] ';
      kb.add(req, ns.rdfs('label'), kb.literal(timeNow + ' Request for ' + docuri), this.appNode);
      kb.add(req, ns.link('requestedURI'), kb.literal(docuri), this.appNode);
      kb.add(req, ns.link('status'), kb.collection(), this.appNode);
    }
  }, {
    key: "saveResponseMetadata",
    value: function saveResponseMetadata(response, options) {
      var kb = this.store;
      var responseNode = kb.bnode();
      kb.add(options.req, ns.link('response'), responseNode, responseNode);
      kb.add(responseNode, ns.http('status'), kb.literal(response.status), responseNode);
      kb.add(responseNode, ns.http('statusText'), kb.literal(response.statusText), responseNode);

      if (!options.resource.uri.startsWith('http')) {
        return responseNode;
      } // Save the response headers


      response.headers.forEach(function (value, header) {
        kb.add(responseNode, ns.httph(header), value, responseNode);

        if (header === 'content-type') {
          kb.add(options.resource, ns.rdf('type'), Util.mediaTypeClass(value), responseNode);
        }
      });
      return responseNode;
    }
  }, {
    key: "objectRefresh",
    value: function objectRefresh(term) {
      var uris = this.store.uris(term); // Get all URIs

      if (typeof uris !== 'undefined') {
        for (var i = 0; i < uris.length; i++) {
          this.refresh(this.store.sym(Uri.docpart(uris[i]))); // what about rterm?
        }
      }
    }
    /* refresh  Reload data from a given document
    **
    ** @param  {NamedNode} term -  An RDF Named Node for the eodcument in question
    ** @param  {function } userCallback - A function userCallback(ok, message, response)
    */

  }, {
    key: "refresh",
    value: function refresh(term, userCallback) {
      // sources_refresh
      this.fireCallbacks('refresh', arguments);
      this.nowOrWhenFetched(term, {
        force: true,
        clearPreviousData: true
      }, userCallback);
    }
    /* refreshIfExpired   Conditional refresh if Expired
    **
    ** @param  {NamedNode} term -  An RDF Named Node for the eodcument in question
    ** @param  {function } userCallback - A function userCallback(ok, message, response)
    */

  }, {
    key: "refreshIfExpired",
    value: function refreshIfExpired(term, userCallback) {
      var exp = this.getHeader(term, 'Expires');

      if (!exp || new Date(exp).getTime() <= new Date().getTime()) {
        this.refresh(term, userCallback);
      } else {
        userCallback(true, 'Not expired', {});
      }
    }
  }, {
    key: "retract",
    value: function retract(term) {
      // sources_retract
      this.store.removeMany(undefined, undefined, undefined, term);

      if (term.uri) {
        delete this.requested[Uri.docpart(term.uri)];
      }

      this.fireCallbacks('retract', arguments);
    }
  }, {
    key: "getState",
    value: function getState(docuri) {
      if (typeof this.requested[docuri] === 'undefined') {
        return 'unrequested';
      } else if (this.requested[docuri] === true) {
        return 'requested';
      } else if (this.requested[docuri] === 'done') {
        return 'fetched';
      } else if (this.requested[docuri] === 'redirected') {
        return this.getState(this.redirectedTo[docuri]);
      } else {
        // An non-200 HTTP error status
        return 'failed';
      }
    }
  }, {
    key: "isPending",
    value: function isPending(docuri) {
      // sources_pending
      // doing anyStatementMatching is wasting time
      // if it's not pending: false -> flailed
      //   'done' -> done 'redirected' -> redirected
      return this.requested[docuri] === true;
    }
  }, {
    key: "unload",
    value: function unload(term) {
      this.store.removeDocument(term);
      delete this.requested[term.uri]; // So it can be loaded again
    }
  }, {
    key: "addHandler",
    value: function addHandler(handler) {
      this.handlers.push(handler);
      handler.register(this);
    }
  }, {
    key: "retryNoCredentials",
    value: function retryNoCredentials(docuri, options) {
      console.log('web: Retrying with no credentials for ' + options.resource);
      options.retriedWithNoCredentials = true; // protect against being called twice

      delete this.requested[docuri]; // forget the original request happened

      var newOptions = Object.assign({}, options, {
        withCredentials: false
      });
      this.addStatus(options.req, 'Abort: Will retry with credentials SUPPRESSED to see if that helps');
      return this.load(docuri, newOptions);
    }
    /**
     * Tests whether a request is being made to a cross-site URI (for purposes
     * of retrying with a proxy)
     *
     * @param uri {string}
     *
     * @returns {boolean}
     */

  }, {
    key: "isCrossSite",
    value: function isCrossSite(uri) {
      // Mashup situation, not node etc
      if (typeof document === 'undefined' || !document.location) {
        return false;
      }

      var hostpart = Uri.hostpart;
      var here = '' + document.location;
      return hostpart(here) && hostpart(uri) && hostpart(here) !== hostpart(uri);
    }
    /**
     * Called when there's a network error in fetch(), or a response
     * with status of 0.
     *
     * @param response {Response|Error}
     * @param docuri {string}
     * @param options {Object}
     *
     * @returns {Promise}
     */

  }, {
    key: "handleError",
    value: function handleError(response, docuri, options) {
      if (this.isCrossSite(docuri)) {
        // Make sure we haven't retried already
        if (options.withCredentials && !options.retriedWithNoCredentials) {
          return this.retryNoCredentials(docuri, options);
        } // Now attempt retry via proxy


        var proxyUri = Fetcher.crossSiteProxy(docuri);

        if (proxyUri && !options.proxyUsed) {
          console.log('web: Direct failed so trying proxy ' + proxyUri);
          return this.redirectToProxy(proxyUri, options);
        }
      }

      var message;

      if (response.message) {
        message = 'Fetch error: ' + response.message;
      } else {
        message = response.statusText;

        if (response.responseText) {
          message += " ".concat(response.responseText);
        }
      } // This is either not a CORS error, or retries have been made


      return this.failFetch(options, message, response.status || 998, response);
    } // deduce some things from the HTTP transaction

  }, {
    key: "addType",
    value: function addType(rdfType, req, kb, locURI) {
      // add type to all redirected resources too
      var prev = req;

      if (locURI) {
        var reqURI = kb.any(prev, ns.link('requestedURI'));

        if (reqURI && reqURI !== locURI) {
          kb.add(kb.sym(locURI), ns.rdf('type'), rdfType, this.appNode);
        }
      }

      for (;;) {
        var doc = kb.any(prev, ns.link('requestedURI'));

        if (doc && doc.value) {
          kb.add(kb.sym(doc.value), ns.rdf('type'), rdfType, this.appNode);
        } // convert Literal


        prev = kb.any(undefined, kb.sym('http://www.w3.org/2007/ont/link#redirectedRequest'), prev);

        if (!prev) {
          break;
        }

        var response = kb.any(prev, kb.sym('http://www.w3.org/2007/ont/link#response'));

        if (!response) {
          break;
        }

        var redirection = kb.any(response, kb.sym('http://www.w3.org/2007/ont/http#status'));

        if (!redirection) {
          break;
        }

        if (redirection !== '301' && redirection !== '302') {
          break;
        }
      }
    }
    /**
     * Handle fetch() response
     *
     * @param response {Response} fetch() response object
     * @param docuri {string}
     * @param options {Object}
     */

  }, {
    key: "handleResponse",
    value: function handleResponse(response, docuri, options) {
      var _this9 = this;

      var kb = this.store;
      var headers = response.headers;
      var reqNode = options.req;
      var responseNode = this.saveResponseMetadata(response, options);
      var contentType = this.normalizedContentType(options, headers) || '';
      var contentLocation = headers.get('content-location'); // this.fireCallbacks('recv', xhr.args)
      // this.fireCallbacks('headers', [{uri: docuri, headers: xhr.headers}])
      // Check for masked errors (CORS, etc)

      if (response.status === 0) {
        console.log('Masked error - status 0 for ' + docuri);
        return this.handleError(response, docuri, options);
      }

      if (response.status >= 400) {
        if (response.status === 404) {
          this.nonexistent[options.original.uri] = true;
          this.nonexistent[docuri] = true;
        }

        return this.saveErrorResponse(response, responseNode).then(function () {
          var errorMessage = options.resource + ' ' + response.statusText;
          return _this9.failFetch(options, errorMessage, response.status, response);
        });
      }

      var diffLocation = null;
      var absContentLocation = null;

      if (contentLocation) {
        absContentLocation = Uri.join(contentLocation, docuri);

        if (absContentLocation !== docuri) {
          diffLocation = absContentLocation;
        }
      }

      if (response.status === 200) {
        this.addType(ns.link('Document'), reqNode, kb, docuri);

        if (diffLocation) {
          this.addType(ns.link('Document'), reqNode, kb, diffLocation);
        } // Before we parse new data clear old but only on 200


        if (options.clearPreviousData) {
          kb.removeDocument(options.resource);
        }

        var isImage = contentType.includes('image/') || contentType.includes('application/pdf');

        if (contentType && isImage) {
          this.addType(kb.sym('http://purl.org/dc/terms/Image'), reqNode, kb, docuri);

          if (diffLocation) {
            this.addType(kb.sym('http://purl.org/dc/terms/Image'), reqNode, kb, diffLocation);
          }
        }
      } // If we have already got the thing at this location, abort


      if (contentLocation) {
        if (!options.force && diffLocation && this.requested[absContentLocation] === 'done') {
          // we have already fetched this
          // should we smush too?
          // log.info("HTTP headers indicate we have already" + " retrieved " +
          // xhr.resource + " as " + absContentLocation + ". Aborting.")
          return this.doneFetch(options, response);
        }

        this.requested[absContentLocation] = true;
      }

      this.parseLinkHeader(headers.get('link'), options.original, reqNode);
      var handler = this.handlerForContentType(contentType, response);

      if (!handler) {
        //  Not a problem, we just don't extract data
        this.addStatus(reqNode, 'Fetch over. No data handled.');
        return this.doneFetch(options, response);
      }

      return response.text().then(function (responseText) {
        response.responseText = responseText;
        return handler.parse(_this9, responseText, options, response);
      });
    }
  }, {
    key: "saveErrorResponse",
    value: function saveErrorResponse(response, responseNode) {
      var kb = this.store;
      return response.text().then(function (content) {
        if (content.length > 10) {
          kb.add(responseNode, ns.http('content'), kb.literal(content), responseNode);
        }
      });
    }
    /**
     * @param contentType {string}
     *
     * @returns {Handler|null}
     */

  }, {
    key: "handlerForContentType",
    value: function handlerForContentType(contentType, response) {
      if (!contentType) {
        return null;
      }

      var Handler = this.handlers.find(function (handler) {
        return contentType.match(handler.pattern);
      });
      return Handler ? new Handler(response) : null;
    }
    /**
     * @param uri {string}
     *
     * @returns {string}
     */

  }, {
    key: "guessContentType",
    value: function guessContentType(uri) {
      return CONTENT_TYPE_BY_EXT[uri.split('.').pop()];
    }
    /**
     * @param options {Object}
     * @param headers {Headers}
     *
     * @returns {string}
     */

  }, {
    key: "normalizedContentType",
    value: function normalizedContentType(options, headers) {
      if (options.forceContentType) {
        return options.forceContentType;
      }

      var contentType = headers.get('content-type');

      if (!contentType || contentType.includes('application/octet-stream')) {
        var guess = this.guessContentType(options.resource.uri);

        if (guess) {
          return guess;
        }
      }

      var protocol = Uri.protocol(options.resource.uri);

      if (!contentType && ['file', 'chrome'].includes(protocol)) {
        return 'text/xml';
      }

      return contentType;
    }
    /**
     * Sends a new request to the specified uri. (Extracted from `onerrorFactory()`)
     *
     * @param newURI {string}
     * @param options {Object}
     *
     * @returns {Promise<Response>}
     */

  }, {
    key: "redirectToProxy",
    value: function redirectToProxy(newURI, options) {
      var _this10 = this;

      this.addStatus(options.req, 'BLOCKED -> Cross-site Proxy to <' + newURI + '>');
      options.proxyUsed = true;
      var kb = this.store;
      var oldReq = options.req; // request metadata blank node

      if (!options.noMeta) {
        kb.add(oldReq, ns.link('redirectedTo'), kb.sym(newURI), oldReq);
        this.addStatus(oldReq, 'redirected to new request'); // why
      }

      this.requested[options.resource.uri] = 'redirected';
      this.redirectedTo[options.resource.uri] = newURI;
      var newOptions = Object.assign({}, options);
      newOptions.baseURI = options.resource.uri;
      return this.fetchUri(newURI, newOptions).then(function (response) {
        if (!newOptions.noMeta) {
          kb.add(oldReq, ns.link('redirectedRequest'), newOptions.req, _this10.appNode);
        }

        return response;
      });
    }
  }, {
    key: "setRequestTimeout",
    value: function setRequestTimeout(uri, options) {
      var _this11 = this;

      return new Promise(function (resolve) {
        _this11.timeouts[uri] = (_this11.timeouts[uri] || []).concat(setTimeout(function () {
          if (_this11.isPending(uri) && !options.retriedWithNoCredentials && !options.proxyUsed) {
            resolve(_this11.failFetch(options, "Request to ".concat(uri, " timed out"), 'timeout'));
          }
        }, _this11.timeout));
      });
    }
  }, {
    key: "addFetchCallback",
    value: function addFetchCallback(uri, callback) {
      if (!this.fetchCallbacks[uri]) {
        this.fetchCallbacks[uri] = [callback];
      } else {
        this.fetchCallbacks[uri].push(callback);
      }
    }
  }, {
    key: "acceptString",
    value: function acceptString() {
      var acceptstring = '';

      for (var mediaType in this.mediatypes) {
        if (acceptstring !== '') {
          acceptstring += ', ';
        }

        acceptstring += mediaType;

        for (var property in this.mediatypes[mediaType]) {
          acceptstring += ';' + property + '=' + this.mediatypes[mediaType][property];
        }
      }

      return acceptstring;
    } // var updatesVia = new $rdf.UpdatesVia(this) // Subscribe to headers
    // @@@@@@@@ This is turned off because it causes a websocket to be set up for ANY fetch
    // whether we want to track it ot not. including ontologies loaed though the XSSproxy

  }], [{
    key: "crossSiteProxy",
    value: function crossSiteProxy(uri) {
      if (Fetcher.crossSiteProxyTemplate) {
        return Fetcher.crossSiteProxyTemplate.replace('{uri}', encodeURIComponent(uri));
      } else {
        return undefined;
      }
    }
    /**
     * @param uri {string}
     *
     * @returns {string}
     */

  }, {
    key: "offlineOverride",
    value: function offlineOverride(uri) {
      // Map the URI to a localhost proxy if we are running on localhost
      // This is used for working offline, e.g. on planes.
      // Is the script itself is running in localhost, then access all
      //   data in a localhost mirror.
      // Do not remove without checking with TimBL
      var requestedURI = uri;
      var UI;

      if (typeof window !== 'undefined' && window.panes && (UI = window.panes.UI) && UI.preferences && UI.preferences.get('offlineModeUsingLocalhost')) {
        if (requestedURI.slice(0, 7) === 'http://' && requestedURI.slice(7, 17) !== 'localhost/') {
          requestedURI = 'http://localhost/' + requestedURI.slice(7);
          log.warn('Localhost kludge for offline use: actually getting <' + requestedURI + '>');
        } else {// log.warn("Localhost kludge NOT USED <" + requestedURI + ">")
        }
      } else {// log.warn("Localhost kludge OFF offline use: actually getting <" +
          //   requestedURI + ">")
        }

      return requestedURI;
    }
  }, {
    key: "proxyIfNecessary",
    value: function proxyIfNecessary(uri) {
      var UI;

      if (typeof window !== 'undefined' && window.panes && (UI = window.panes.UI) && UI.isExtension) {
        return uri;
      } // Extension does not need proxy


      if (typeof $SolidTestEnvironment !== 'undefined' && $SolidTestEnvironment.localSiteMap) {
        // nested dictionaries of URI parts from origin down
        var hostpath = uri.split('/').slice(2); // the bit after the //

        var lookup = function lookup(parts, index) {
          var z = index[parts.shift()];

          if (!z) {
            return null;
          }

          if (typeof z === 'string') {
            return z + parts.join('/');
          }

          if (!parts) {
            return null;
          }

          return lookup(parts, z);
        };

        var y = lookup(hostpath, $SolidTestEnvironment.localSiteMap);

        if (y) {
          return y;
        }
      } // browser does 2014 on as https browser script not trusted
      // If the web app origin is https: then the mixed content rules
      // prevent it loading insecure http: stuff so we need proxy.


      if (Fetcher.crossSiteProxyTemplate && typeof document !== 'undefined' && document.location && ('' + document.location).slice(0, 6) === 'https:' && // origin is secure
      uri.slice(0, 5) === 'http:') {
        // requested data is not
        return Fetcher.crossSiteProxyTemplate.replace('{uri}', encodeURIComponent(uri));
      }

      return uri;
    }
    /**
     * Tests whether the uri's protocol is supported by the Fetcher.
     *
     * @param uri {string}
     *
     * @returns {boolean}
     */

  }, {
    key: "unsupportedProtocol",
    value: function unsupportedProtocol(uri) {
      var pcol = Uri.protocol(uri);
      return pcol === 'tel' || pcol === 'mailto' || pcol === 'urn';
    }
    /**
     * @param requestedURI {string}
     * @param options {Object}
     *
     * @returns {boolean}
     */

  }, {
    key: "withCredentials",
    value: function withCredentials(requestedURI) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      // 2014 problem:
      // XMLHttpRequest cannot load http://www.w3.org/People/Berners-Lee/card.
      // A wildcard '*' cannot be used in the 'Access-Control-Allow-Origin'
      //   header when the credentials flag is true.
      // @ Many ontology files under http: and need CORS wildcard ->
      //   can't have withCredentials
      // @@ Kludge -- need for webid which typically is served from https
      var withCredentials = requestedURI.startsWith('https:');

      if (options.withCredentials !== undefined) {
        withCredentials = options.withCredentials;
      }

      return withCredentials;
    }
  }]);

  return Fetcher;
}();

module.exports = Fetcher;
module.exports.HANDLERS = HANDLERS;
module.exports.CONTENT_TYPE_BY_EXT = CONTENT_TYPE_BY_EXT;