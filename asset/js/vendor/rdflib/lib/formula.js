'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var BlankNode = require('./blank-node');

var ClassOrder = require('./class-order');

var Collection = require('./collection');

var Literal = require('./literal');

var log = require('./log');

var NamedNode = require('./named-node');

var Node = require('./node');

var Serializer = require('./serialize');

var Statement = require('./statement');

var Variable = require('./variable');
/** @module formula */


var Formula =
/*#__PURE__*/
function (_Node) {
  _inherits(Formula, _Node);

  /**
  * @constructor
  * @param statements - Initial array of statements
  * @param constraints - initial array of constraints
  * @param initBindings - initial bindings used in Query
  * @param optional - optional
  */
  function Formula(statements, constraints, initBindings, optional) {
    var _this;

    _classCallCheck(this, Formula);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Formula).call(this));
    _this.termType = Formula.termType;
    _this.statements = statements || [];
    _this.constraints = constraints || [];
    _this.initBindings = initBindings || [];
    _this.optional = optional || [];
    return _this;
  }
  /** Add a statement from its parts
  * @param {Node} subject - the first part of the statemnt
  * @param {Node} predicate - the second part of the statemnt
  * @param {Node} obbject - the third part of the statemnt
  * @param {Node} graph - the last part of the statemnt
  */


  _createClass(Formula, [{
    key: "add",
    value: function add(subject, predicate, object, graph) {
      return this.statements.push(new Statement(subject, predicate, object, graph));
    }
    /** Add a statment object
    * @param {Statement} statement - an existing constructed statement to add
    */

  }, {
    key: "addStatement",
    value: function addStatement(st) {
      return this.statements.push(st);
    }
  }, {
    key: "bnode",
    value: function bnode(id) {
      return new BlankNode(id);
    }
  }, {
    key: "addAll",
    value: function addAll(statements) {
      var _this2 = this;

      statements.forEach(function (quad) {
        _this2.add(quad.subject, quad.predicate, quad.object, quad.graph);
      });
    }
    /** Follow link from one node, using one wildcard, looking for one
    *
    * For example, any(me, knows, null, profile)  - a person I know accoring to my profile .
    * any(me, knows, null, null)  - a person I know accoring to anything in store .
    * any(null, knows, me, null)  - a person who know me accoring to anything in store .
    *
    * @param {Node} subject - A node to search for as subject, or if null, a wildcard
    * @param {Node} predicate - A node to search for as predicate, or if null, a wildcard
    * @param {Node} object - A node to search for as object, or if null, a wildcard
    * @param {Node} graph - A node to search for as graph, or if null, a wildcard
    * @returns {Node} - A node which match the wildcard position, or null
    */

  }, {
    key: "any",
    value: function any(s, p, o, g) {
      var st = this.anyStatementMatching(s, p, o, g);

      if (st == null) {
        return void 0;
      } else if (s == null) {
        return st.subject;
      } else if (p == null) {
        return st.predicate;
      } else if (o == null) {
        return st.object;
      }

      return void 0;
    }
  }, {
    key: "anyValue",
    value: function anyValue(s, p, o, g) {
      var y = this.any(s, p, o, g);
      return y ? y.value : void 0;
    }
  }, {
    key: "anyStatementMatching",
    value: function anyStatementMatching(subj, pred, obj, why) {
      var x = this.statementsMatching(subj, pred, obj, why, true);

      if (!x || x.length === 0) {
        return undefined;
      }

      return x[0];
    }
    /** Search the Store
     *
     * This is really a teaching method as to do this properly you would use IndexedFormula
     *
     * @param {Node} subject - A node to search for as subject, or if null, a wildcard
     * @param {Node} predicate - A node to search for as predicate, or if null, a wildcard
     * @param {Node} object - A node to search for as object, or if null, a wildcard
     * @param {Node} graph - A node to search for as graph, or if null, a wildcard
     * @param {Boolean} justOne - flag - stop when found one rather than get all of them?
     * @returns {Array<Node>} - An array of nodes which match the wildcard position
     */

  }, {
    key: "statementsMatching",
    value: function statementsMatching(subj, pred, obj, why, justOne) {
      var found = this.statements.filter(function (st) {
        return (!subj || subj.sameTerm(st.subject)) && (!pred || pred.sameTerm(st.predicate)) && (!obj || subj.sameTerm(st.object)) && (!why || why.sameTerm(st.subject));
      });
      return found;
    }
    /**
     * Finds the types in the list which have no *stored* subtypes
     * These are a set of classes which provide by themselves complete
     * information -- the other classes are redundant for those who
     * know the class DAG.
     */

  }, {
    key: "bottomTypeURIs",
    value: function bottomTypeURIs(types) {
      var bots;
      var bottom;
      var elt;
      var i;
      var k;
      var len;
      var ref;
      var subs;
      var v;
      bots = [];

      for (k in types) {
        if (!types.hasOwnProperty(k)) continue;
        v = types[k];
        subs = this.each(void 0, this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), this.sym(k));
        bottom = true;
        i = 0;

        for (len = subs.length; i < len; i++) {
          elt = subs[i];
          ref = elt.uri;

          if (ref in types) {
            // the subclass is one we know
            bottom = false;
            break;
          }
        }

        if (bottom) {
          bots[k] = v;
        }
      }

      return bots;
    }
  }, {
    key: "collection",
    value: function collection() {
      return new Collection();
    }
    /** Follow links from one node, using one wildcard
    *
    * For example, each(me, knows, null, profile)  - people I know accoring to my profile .
    * each(me, knows, null, null)  - people I know accoring to anything in store .
    * each(null, knows, me, null)  - people who know me accoring to anything in store .
    *
    * @param {Node} subject - A node to search for as subject, or if null, a wildcard
    * @param {Node} predicate - A node to search for as predicate, or if null, a wildcard
    * @param {Node} object - A node to search for as object, or if null, a wildcard
    * @param {Node} graph - A node to search for as graph, or if null, a wildcard
    * @returns {Array<Node>} - An array of nodes which match the wildcard position
    */

  }, {
    key: "each",
    value: function each(s, p, o, g) {
      var elt, i, l, m, q;
      var len, len1, len2, len3;
      var results = [];
      var sts = this.statementsMatching(s, p, o, g, false);

      if (s == null) {
        for (i = 0, len = sts.length; i < len; i++) {
          elt = sts[i];
          results.push(elt.subject);
        }
      } else if (p == null) {
        for (l = 0, len1 = sts.length; l < len1; l++) {
          elt = sts[l];
          results.push(elt.predicate);
        }
      } else if (o == null) {
        for (m = 0, len2 = sts.length; m < len2; m++) {
          elt = sts[m];
          results.push(elt.object);
        }
      } else if (g == null) {
        for (q = 0, len3 = sts.length; q < len3; q++) {
          elt = sts[q];
          results.push(elt.why);
        }
      }

      return results;
    }
  }, {
    key: "equals",
    value: function equals(other) {
      if (!other) {
        return false;
      }

      return this.hashString() === other.hashString();
    }
    /*
    For thisClass or any subclass, anything which has it is its type
    or is the object of something which has the type as its range, or subject
    of something which has the type as its domain
    We don't bother doing subproperty (yet?)as it doesn't seeem to be used much.
    Get all the Classes of which we can RDFS-infer the subject is a member
    @returns a hash of URIs
    */

    /**
     * For thisClass or any subclass, anything which has it is its type
     * or is the object of something which has the type as its range, or subject
     * of something which has the type as its domain
     * We don't bother doing subproperty (yet?)as it doesn't seeem to be used
     * much.
     * Get all the Classes of which we can RDFS-infer the subject is a member
     * @return a hash of URIs
     */

  }, {
    key: "findMembersNT",
    value: function findMembersNT(thisClass) {
      var i;
      var l;
      var len;
      var len1;
      var len2;
      var len3;
      var len4;
      var m;
      var members;
      var pred;
      var q;
      var ref;
      var ref1;
      var ref2;
      var ref3;
      var ref4;
      var ref5;
      var seeds;
      var st;
      var t;
      var u;
      seeds = {};
      seeds[thisClass.toNT()] = true;
      members = {};
      ref = this.transitiveClosure(seeds, this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), true);

      for (t in ref) {
        if (!ref.hasOwnProperty(t)) continue;
        ref1 = this.statementsMatching(void 0, this.sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), this.fromNT(t));

        for (i = 0, len = ref1.length; i < len; i++) {
          st = ref1[i];
          members[st.subject.toNT()] = st;
        }

        ref2 = this.each(void 0, this.sym('http://www.w3.org/2000/01/rdf-schema#domain'), this.fromNT(t));

        for (l = 0, len1 = ref2.length; l < len1; l++) {
          pred = ref2[l];
          ref3 = this.statementsMatching(void 0, pred);

          for (m = 0, len2 = ref3.length; m < len2; m++) {
            st = ref3[m];
            members[st.subject.toNT()] = st;
          }
        }

        ref4 = this.each(void 0, this.sym('http://www.w3.org/2000/01/rdf-schema#range'), this.fromNT(t));

        for (q = 0, len3 = ref4.length; q < len3; q++) {
          pred = ref4[q];
          ref5 = this.statementsMatching(void 0, pred);

          for (u = 0, len4 = ref5.length; u < len4; u++) {
            st = ref5[u];
            members[st.object.toNT()] = st;
          }
        }
      }

      return members;
    }
  }, {
    key: "findMemberURIs",
    value: function findMemberURIs(subject) {
      return this.NTtoURI(this.findMembersNT(subject));
    }
    /**
     * Get all the Classes of which we can RDFS-infer the subject is a superclass
     * Returns a hash table where key is NT of type and value is statement why we
     * think so.
     * Does NOT return terms, returns URI strings.
     * We use NT representations in this version because they handle blank nodes.
     */

  }, {
    key: "findSubClassesNT",
    value: function findSubClassesNT(subject) {
      var types = {};
      types[subject.toNT()] = true;
      return this.transitiveClosure(types, this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), true);
    }
    /**
     * Get all the Classes of which we can RDFS-infer the subject is a subclass
     * @param {NamedNode} subject - The thing whose classes are to be found
     * @returns a hash table where key is NT of type and value is statement why we
     * think so.
     * Does NOT return terms, returns URI strings.
     * We use NT representations in this version because they handle blank nodes.
     */

  }, {
    key: "findSuperClassesNT",
    value: function findSuperClassesNT(subject) {
      var types = {};
      types[subject.toNT()] = true;
      return this.transitiveClosure(types, this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), false);
    }
    /**
     * Get all the Classes of which we can RDFS-infer the subject is a member
     * todo: This will loop is there is a class subclass loop (Sublass loops are
     * not illegal)
     * @param {NamedNode} subject - The thing whose classes are to be found
     * @returns a hash table where key is NT of type and value is statement why we think so.
     * Does NOT return terms, returns URI strings.
     * We use NT representations in this version because they handle blank nodes.
     */

  }, {
    key: "findTypesNT",
    value: function findTypesNT(subject) {
      var domain;
      var i;
      var l;
      var len;
      var len1;
      var len2;
      var len3;
      var m;
      var q;
      var range;
      var rdftype;
      var ref;
      var ref1;
      var ref2;
      var ref3;
      var st;
      var types;
      rdftype = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
      types = [];
      ref = this.statementsMatching(subject, void 0, void 0);

      for (i = 0, len = ref.length; i < len; i++) {
        st = ref[i];

        if (st.predicate.uri === rdftype) {
          types[st.object.toNT()] = st;
        } else {
          ref1 = this.each(st.predicate, this.sym('http://www.w3.org/2000/01/rdf-schema#domain'));

          for (l = 0, len1 = ref1.length; l < len1; l++) {
            range = ref1[l];
            types[range.toNT()] = st;
          }
        }
      }

      ref2 = this.statementsMatching(void 0, void 0, subject);

      for (m = 0, len2 = ref2.length; m < len2; m++) {
        st = ref2[m];
        ref3 = this.each(st.predicate, this.sym('http://www.w3.org/2000/01/rdf-schema#range'));

        for (q = 0, len3 = ref3.length; q < len3; q++) {
          domain = ref3[q];
          types[domain.toNT()] = st;
        }
      }

      return this.transitiveClosure(types, this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'), false);
    }
  }, {
    key: "findTypeURIs",
    value: function findTypeURIs(subject) {
      return this.NTtoURI(this.findTypesNT(subject));
    }
    /** Trace statements which connect directly, or through bnodes
     *
     * @param {NamedNode} subject - The node to start looking for statments
     * @param {NamedNode} doc - The document to be searched, or null to search all documents
     * @returns an array of statements, duplicate statements are suppresssed.
     */

  }, {
    key: "connectedStatements",
    value: function connectedStatements(subject, doc, excludePredicateURIs) {
      excludePredicateURIs = excludePredicateURIs || [];
      var todo = [subject];
      var done = [];
      var doneArcs = [];
      var result = [];
      var self = this;

      var follow = function follow(x) {
        var queue = function queue(x) {
          if (x.termType === 'BlankNode' && !done[x.value]) {
            done[x.value] = true;
            todo.push(x);
          }
        };

        var sts = self.statementsMatching(null, null, x, doc).concat(self.statementsMatching(x, null, null, doc));
        sts = sts.filter(function (st) {
          if (excludePredicateURIs[st.predicate.uri]) return false;
          var hash = st.toNT();
          if (doneArcs[hash]) return false;
          doneArcs[hash] = true;
          return true;
        });
        sts.forEach(function (st, i) {
          queue(st.subject);
          queue(st.object);
        });
        result = result.concat(sts);
      };

      while (todo.length) {
        follow(todo.shift());
      } // console.log('' + result.length + ' statements about ' + subject)


      return result;
    }
  }, {
    key: "formula",
    value: function formula() {
      return new Formula();
    }
    /**
     * Transforms an NTriples string format into a Node.
     * The bnode bit should not be used on program-external values; designed
     * for internal work such as storing a bnode id in an HTML attribute.
     * This will only parse the strings generated by the vaious toNT() methods.
     */

  }, {
    key: "fromNT",
    value: function fromNT(str) {
      var dt, k, lang;

      switch (str[0]) {
        case '<':
          return this.sym(str.slice(1, -1));

        case '"':
          lang = void 0;
          dt = void 0;
          k = str.lastIndexOf('"');

          if (k < str.length - 1) {
            if (str[k + 1] === '@') {
              lang = str.slice(k + 2);
            } else if (str.slice(k + 1, k + 3) === '^^') {
              dt = this.fromNT(str.slice(k + 3));
            } else {
              throw new Error("Can't convert string from NT: " + str);
            }
          }

          str = str.slice(1, k);
          str = str.replace(/\\"/g, '"');
          str = str.replace(/\\n/g, '\n');
          str = str.replace(/\\\\/g, '\\');
          return this.literal(str, lang, dt);

        case '_':
          return new BlankNode(str.slice(2));

        case '?':
          return new Variable(str.slice(1));
      }

      throw new Error("Can't convert from NT: " + str);
    }
  }, {
    key: "holds",
    value: function holds(s, p, o, g) {
      var i;

      if (arguments.length === 1) {
        if (!s) {
          return true;
        }

        if (s instanceof Array) {
          for (i = 0; i < s.length; i++) {
            if (!this.holds(s[i])) {
              return false;
            }
          }

          return true;
        } else if (s instanceof Statement) {
          return this.holds(s.subject, s.predicate, s.object, s.why);
        } else if (s.statements) {
          return this.holds(s.statements);
        }
      }

      var st = this.anyStatementMatching(s, p, o, g);
      return st != null;
    }
  }, {
    key: "holdsStatement",
    value: function holdsStatement(st) {
      return this.holds(st.subject, st.predicate, st.object, st.why);
    }
  }, {
    key: "list",
    value: function list(values) {
      var collection = new Collection();
      values.forEach(function (val) {
        collection.append(val);
      });
      return collection;
    }
  }, {
    key: "literal",
    value: function literal(val, lang, dt) {
      return new Literal('' + val, lang, dt);
    }
    /**
     * transform a collection of NTriple URIs into their URI strings
     * @param t some iterable colletion of NTriple URI strings
     * @return a collection of the URIs as strings
     * todo: explain why it is important to go through NT
     */

  }, {
    key: "NTtoURI",
    value: function NTtoURI(t) {
      var k, v;
      var uris = {};

      for (k in t) {
        if (!t.hasOwnProperty(k)) continue;
        v = t[k];

        if (k[0] === '<') {
          uris[k.slice(1, -1)] = v;
        }
      }

      return uris;
    }
  }, {
    key: "serialize",
    value: function serialize(base, contentType, provenance) {
      var documentString;
      var sts;
      var sz;
      sz = Serializer(this);
      sz.suggestNamespaces(this.namespaces);
      sz.setBase(base);

      if (provenance) {
        sts = this.statementsMatching(void 0, void 0, void 0, provenance);
      } else {
        sts = this.statements;
      }

      switch (contentType != null ? contentType : 'text/n3') {
        case 'application/rdf+xml':
          documentString = sz.statementsToXML(sts);
          break;

        case 'text/n3':
        case 'text/turtle':
          documentString = sz.statementsToN3(sts);
          break;

        default:
          throw new Error('serialize: Content-type ' + contentType + ' not supported.');
      }

      return documentString;
    }
  }, {
    key: "substitute",
    value: function substitute(bindings) {
      var statementsCopy = this.statements.map(function (ea) {
        return ea.substitute(bindings);
      });
      console.log('Formula subs statmnts:' + statementsCopy);
      var y = new Formula();
      y.add(statementsCopy);
      console.log('indexed-form subs formula:' + y);
      return y;
    }
  }, {
    key: "sym",
    value: function sym(uri, name) {
      if (name) {
        throw new Error('This feature (kb.sym with 2 args) is removed. Do not assume prefix mappings.');
      }

      return new NamedNode(uri);
    }
  }, {
    key: "the",
    value: function the(s, p, o, g) {
      var x = this.any(s, p, o, g);

      if (x == null) {
        log.error('No value found for the() {' + s + ' ' + p + ' ' + o + '}.');
      }

      return x;
    }
    /**
     * RDFS Inference
     * These are hand-written implementations of a backward-chaining reasoner
     * over the RDFS axioms.
     * @param seeds {Object} a hash of NTs of classes to start with
     * @param predicate The property to trace though
     * @param inverse trace inverse direction
     */

  }, {
    key: "transitiveClosure",
    value: function transitiveClosure(seeds, predicate, inverse) {
      var elt, i, len, s, sups, t;
      var agenda = {};
      Object.assign(agenda, seeds); // make a copy

      var done = {}; // classes we have looked up

      while (true) {
        t = function () {
          for (var p in agenda) {
            if (!agenda.hasOwnProperty(p)) continue;
            return p;
          }
        }();

        if (t == null) {
          return done;
        }

        sups = inverse ? this.each(void 0, predicate, this.fromNT(t)) : this.each(this.fromNT(t), predicate);

        for (i = 0, len = sups.length; i < len; i++) {
          elt = sups[i];
          s = elt.toNT();

          if (s in done) {
            continue;
          }

          if (s in agenda) {
            continue;
          }

          agenda[s] = agenda[t];
        }

        done[t] = agenda[t];
        delete agenda[t];
      }
    }
    /**
     * Finds the types in the list which have no *stored* supertypes
     * We exclude the universal class, owl:Things and rdf:Resource, as it is
     * information-free.
     */

  }, {
    key: "topTypeURIs",
    value: function topTypeURIs(types) {
      var i;
      var j;
      var k;
      var len;
      var n;
      var ref;
      var tops;
      var v;
      tops = [];

      for (k in types) {
        if (!types.hasOwnProperty(k)) continue;
        v = types[k];
        n = 0;
        ref = this.each(this.sym(k), this.sym('http://www.w3.org/2000/01/rdf-schema#subClassOf'));

        for (i = 0, len = ref.length; i < len; i++) {
          j = ref[i];

          if (j.uri !== 'http://www.w3.org/2000/01/rdf-schema#Resource') {
            n++;
            break;
          }
        }

        if (!n) {
          tops[k] = v;
        }
      }

      if (tops['http://www.w3.org/2000/01/rdf-schema#Resource']) {
        delete tops['http://www.w3.org/2000/01/rdf-schema#Resource'];
      }

      if (tops['http://www.w3.org/2002/07/owl#Thing']) {
        delete tops['http://www.w3.org/2002/07/owl#Thing'];
      }

      return tops;
    }
  }, {
    key: "toString",
    value: function toString() {
      return '{' + this.statements.join('\n') + '}';
    }
  }, {
    key: "whether",
    value: function whether(s, p, o, g) {
      return this.statementsMatching(s, p, o, g, false).length;
    }
  }]);

  return Formula;
}(Node);

Formula.termType = 'Graph';
Formula.prototype.classOrder = ClassOrder['Graph'];
Formula.prototype.isVar = 0;
Formula.prototype.ns = require('./namespace');

Formula.prototype.variable = function (name) {
  return new Variable(name);
};

module.exports = Formula;