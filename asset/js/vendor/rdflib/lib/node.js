'use strict';
/**
 * The superclass of all RDF Statement objects, that is
 * NamedNode, Literal, BlankNode, etc.
 * @class Node
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Node =
/*#__PURE__*/
function () {
  function Node() {
    _classCallCheck(this, Node);
  }

  _createClass(Node, [{
    key: "substitute",
    value: function substitute(bindings) {
      console.log('@@@ node substitute' + this);
      return this;
    }
  }, {
    key: "compareTerm",
    value: function compareTerm(other) {
      if (this.classOrder < other.classOrder) {
        return -1;
      }

      if (this.classOrder > other.classOrder) {
        return +1;
      }

      if (this.value < other.value) {
        return -1;
      }

      if (this.value > other.value) {
        return +1;
      }

      return 0;
    }
  }, {
    key: "equals",
    value: function equals(other) {
      if (!other) {
        return false;
      }

      return this.termType === other.termType && this.value === other.value;
    }
  }, {
    key: "hashString",
    value: function hashString() {
      return this.toCanonical();
    }
  }, {
    key: "sameTerm",
    value: function sameTerm(other) {
      return this.equals(other);
    }
  }, {
    key: "toCanonical",
    value: function toCanonical() {
      return this.toNT();
    }
  }, {
    key: "toNT",
    value: function toNT() {
      return this.toString();
    }
  }, {
    key: "toString",
    value: function toString() {
      throw new Error('Node.toString() is abstract - see the subclasses instead');
    }
  }]);

  return Node;
}();

module.exports = Node;
/**
 * Creates an RDF Node from a native javascript value.
 * RDF Nodes are returned unchanged, undefined returned as itself.
 * @method fromValue
 * @static
 * @param value {Node|Date|String|Number|Boolean|Undefined}
 * @return {Node|Collection}
 */

Node.fromValue = function fromValue(value) {
  var Collection = require('./collection');

  var Literal = require('./literal');

  var NamedNode = require('./named-node');

  if (typeof value === 'undefined' || value === null) {
    return value;
  }

  var isNode = value && value.termType;

  if (isNode) {
    // a Node subclass or a Collection
    return value;
  }

  if (Array.isArray(value)) {
    return new Collection(value);
  }

  return Literal.fromValue(value);
};

Node.toJS = function fromJS(term) {
  if (term.elements) {
    return term.elements.map(Node.toJS); // Array node (not standard RDFJS)
  }

  if (!term.datatype) return term; // Objects remain objects

  if (term.datatype.equals(ns.xsd('boolean'))) {
    return term.value === '1';
  }

  if (term.datatype.equals(ns.xsd('dateTime')) || term.datatype.equals(ns.xsd('date'))) {
    return new Date(term.value);
  }

  if (term.datatype.equals(ns.xsd('integer')) || term.datatype.equals(ns.xsd('float')) || term.datatype.equals(ns.xsd('decimal'))) {
    return Number(term.value);
  }

  return term.value;
};