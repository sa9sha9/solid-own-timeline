'use strict';

const RDF = new $rdf.Namespace( "http://www.w3.org/1999/02/22-rdf-syntax-ns#" )
const RDFS = new $rdf.Namespace( "http://www.w3.org/2000/01/rdf-schema#" )
const FOAF = new $rdf.Namespace( "http://xmlns.com/foaf/0.1/" )
const XSD = new $rdf.Namespace( "http://www.w3.org/2001/XMLSchema#" )
const VCARD = new $rdf.Namespace( 'http://www.w3.org/2006/vcard/ns#' );
const DCT = $rdf.Namespace( "http://purl.org/dc/terms/" );
const LDP = $rdf.Namespace( "http://www.w3.org/ns/ldp#" );
const SIOC = $rdf.Namespace( "http://rdfs.org/sioc/ns#" );
const SOLID = $rdf.Namespace( "http://www.w3.org/ns/solid/terms#" );
const ACT = $rdf.Namespace( "https://www.w3.org/ns/activitystreams#" );

const store = $rdf.graph()
const timeout = 5000 // 5000 ms timeout
const fetcher = new $rdf.Fetcher( store, timeout )
const updater = new $rdf.UpdateManager( store )

const webId = 'https://sa9sha9.inrupt.net'

const me = store.sym( `${webId}/profile/card#me'` )
const profile = me.doc();


// // using statementsMatching
// store.add( `${webId}/public/`, VCARD( 'name' ), 'hoge' );
// store.add( `${webId}/public/hoge`, VCARD( 'name' ), 'fuga' );
// store.add( `${webId}/public/fuga`, VCARD('name'), 'aaaaa' );
//
// var names = store.statementsMatching(undefined, VCARD('name'), undefined)

// Library
// escape HTML code
const encodeHTML = function( html ) {
	return html
	.replace( /&/g, "&amp;" )
	.replace( /</g, "&lt;" )
	.replace( />/g, "&gt;" )
	.replace( /"/g, "&quot;" )
	.replace( /'/g, "&#039;" );
};

const decodeHTML = function( html ) {
	return html
	.replace( /&amp;/g, "&" )
	.replace( /&lt;/g, "<" )
	.replace( /&gt;/g, ">" )
	.replace( /&quot;/g, "\"" )
	.replace( /&#039;/g, "'" );
};


// Add name as quad
// let res = store.add(me, VCARD('name'), "WILLIAMS SIMON", profile);


// // Create new Statement
// let st = $rdf.st( me, FOAF( 'hoge' ), "Joe Bloggs", me.doc() );
//
// debugger
//
// function setName( person, name, doc ) {
// 	let ins = store.add( person, VCARD( 'name' ), name, doc ); // st?
// 	let del = []
// 	updater.update( del, ins, ( uri, ok, msg ) => {
// 		debugger
// 	} )
// }
//


// const name = getName( me )
//
// function getName( person ) {
// 	// Fetch name as quad
// 	// let name = store.any(me, VCARD('name'), null, profile)
//
// 	// Fetch name as Triple
// 	let nameTriple = store.any( person, VCARD( 'name' ) );
// 	return nameTriple;
// }

//
// setName( me, "WILLIAMS SIMON", profile )
// const name = getName( me )
//
// debugger
//
// fetcher.nowOrWhenFetched( id, function( ok, body, xhr ) {
// 	if( !ok ) {
// 		console.log( "Oops, something happened and couldn't fetch data" );
// 	} else {
// 		// do something with the data in the store (see below)
// 		debugger
// 	}
// } )

getPublicContainer( webId )

function getPublicContainer( id ) {
	const LDP = $rdf.Namespace( 'http://www.w3.org/ns/ldp#' );

	let folder = $rdf.sym( `${id}/public/` );  // NOTE: Ends in a slash
	debugger
	fetcher.load( folder ).then( () => {
		let files = store.each( folder, LDP( 'contains' ) );
		debugger
		// files.forEach( file ){
		// 	console.log( ' contains ' + file );
		// }
	} );
}


// Make data
const authors = [
	{ name: 'sa9sha9', sex: 'male', picture: 'hoge.jpg' }
]
const post = {
	filename: 'index.ttl',
	title   : 'This is title',
	created : '2019-01-17T00:00:00',
	modified: '2019-01-17T00:00:00',
	body    : 'This is a body',
	author  : 0,
}
makePost( authors, post )

function makePost( authors, post ) {
	const container = `${webId}/public/Test/facebook/`

	store.add( $rdf.sym( container ), RDF( 'type' ), SIOC( 'Post' ) );
	// store.add( $rdf.sym(container), DCT( 'title' ), $rdf.lit( post.title ) );
	// store.add( $rdf.sym(container), SIOC( 'has_creator' ), $rdf.sym( `${container}#author` ) );
	// store.add( $rdf.sym(container), DCT( 'created' ), $rdf.lit( post.created, '', XSD( 'dateTime' ) ) );
	// store.add( $rdf.sym(container), DCT( 'modified' ), $rdf.lit( post.modified, '', XSD( 'dateTime' ) ) );
	store.add( $rdf.sym( container ), SIOC( 'content' ), $rdf.lit( post.body ) );

	// store.add( $rdf.sym( `${container}#author` ), RDF( 'type' ), SIOC( 'UserAccount' ) );
	// store.add( $rdf.sym( `${container}#author` ), SIOC( 'account_of' ), $rdf.sym( post.author ) );
	// store.add( $rdf.sym( `${container}#author` ), FOAF( 'name' ), $rdf.lit( authors[ post.author ].name ) );
	// store.add( $rdf.sym( `${container}#author` ), SIOC( 'avatar' ), $rdf.sym( authors[ post.author ].picture ) );

	let triples = new $rdf.Serializer( store ).toN3( store )
	post.body = triples
	createPost(container, post)

	// if (url) {
	// 	let writer = Solid.web.put(url, triples);
	// } else {
	// 	let slug = makeSlug(post.title);
	// 	let writer = Solid.web.post(config.postsURL, slug, triples);
	// }
	// writer.then(
	// 	function(res) {
	// 		// all done, clean up and go to initial state
	// 		if (res.url.slice(0,4) !== 'http') {
	// 			res.url = config.postsURL.slice(0, config.postsURL.lastIndexOf('/') + 1)+slug;
	// 		}
	// 		cancelPost('?post='+encodeURIComponent(res.url));
	// 	}
	// )
	// .catch(
	// 	function(err) {
	// 		console.log("Could not create post!");
	// 		console.log(err);
	// 		notify('error', 'Could not create post');
	// 		resetAll();
	// 	}
	// );
}


function createPostWithRandomName( container, post ) {
	const uri = container
	fetcher.webOperation( 'POST', uri, {
		contentType: 'text/turtle',
		body       : post.body,
	} )
	.then(
		function( res ) {
			// all done, clean up and go to initial state
			debugger
		}
	)
	.catch(
		function( err ) {
			debugger
		}
	)
}

function createPost( container, post ) {
	const uri = container + post.filename
	fetcher.webOperation( 'PUT', uri, {
		contentType: 'text/turtle',
		body       : post.body,
	} )
	.then(
		function( res ) {
			// all done, clean up and go to initial state
			debugger
		}
	)
	.catch(
		function( err ) {
			debugger
		}
	)
}

function deletePost( uri ) {
	fetcher.webOperation( 'DELETE', uri )
	.then( ( res ) => {
		debugger
	} )
	.catch( ( err ) => {
		debugger
	} )
}
