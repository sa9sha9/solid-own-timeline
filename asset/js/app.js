'use strict';

const RDF = new $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
const RDFS = new $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#")
const FOAF = new $rdf.Namespace("http://xmlns.com/foaf/0.1/")
const XSD = new $rdf.Namespace("http://www.w3.org/2001/XMLSchema#")
const VCARD = new $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');

const store = $rdf.graph()
const timeout = 5000 // 5000 ms timeout
const fetcher = new $rdf.Fetcher(store, timeout)
const updater = new $rdf.UpdateManager(store)

const id = 'https://sa9sha9.inrupt.net/profile/card#me'

const me = store.sym(id)
const profile = me.doc();

// Add name as quad
// let res = store.add(me, VCARD('name'), "WILLIAMS SIMON", profile);


// Create new Statement
let st = $rdf.st(me, FOAF('hoge'), "Joe Bloggs", me.doc());

debugger

function setName(person, name, doc) {
	let ins = store.add(person, VCARD('name'), name, doc); // st?
	let del = []
	updater.update(del, ins, (uri, ok, msg) => {
		debugger
	} )
}

function getName(person) {
	// Fetch name as quad
	// let name = store.any(me, VCARD('name'), null, profile)

	// Fetch name as Triple
	let nameTriple = store.any(me, VCARD('name'));
	return nameTriple;
}

setName(me, "WILLIAMS SIMON", profile)
const name = getName(me)

debugger

fetcher.nowOrWhenFetched(id, function(ok, body, xhr) {
	if (!ok) {
		console.log("Oops, something happened and couldn't fetch data");
	} else {
		// do something with the data in the store (see below)
		debugger
	}
})