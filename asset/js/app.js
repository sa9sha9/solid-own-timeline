'use strict';

var RDF = new $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
var RDFS = new $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#")
var FOAF = new $rdf.Namespace("http://xmlns.com/foaf/0.1/")
var XSD = new $rdf.Namespace("http://www.w3.org/2001/XMLSchema#")

var store = $rdf.graph()
var timeout = 5000 // 5000 ms timeout
var fetcher = new $rdf.Fetcher(store, timeout)
var url = 'https://sa9sha9.inrupt.net/profile/card#me'

fetcher.nowOrWhenFetched(url, function(ok, body, xhr) {
	if (!ok) {
		console.log("Oops, something happened and couldn't fetch data");
	} else {
		// do something with the data in the store (see below)
		debugger
	}
})