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

// getPublicContainer( webId )
//
// function getPublicContainer( id ) {
// 	const LDP = $rdf.Namespace( 'http://www.w3.org/ns/ldp#' );
//
// 	let folder = $rdf.sym( `${id}/public/` );  // NOTE: Ends in a slash
// 	debugger
// 	fetcher.load( folder ).then( () => {
// 		let files = store.each( folder, LDP( 'contains' ) );
// 		debugger
// 		// files.forEach( file ){
// 		// 	console.log( ' contains ' + file );
// 		// }
// 	} );
// }


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

const hoge =
{
	"created_at":"Thu Apr 06",
	"text":"お餅食べすぎたもうきなこだけでいい",
	"url":"https://t.co/XweGGOWIIEN123K",
	"retweet_count":284,
	"favorite_count":0,
	"replies": ...
}
const fuga =
{
	"id"                    : "220494
	"published"       : "Thu Apr 06",
	"message"        : "薬学博士とかいないかな",
	"permalink_url": "https..."
	"likes"                : 24,
	"comments"     : ...
}
const zuba = [
	{
		"type": "Note",
		"id": "me",
		"origin": "https://twitter.com",
		"content": "お餅食べすぎたもうきなこだけでいい",
		"published": "Thu Apr 06",
		"url":"https://t.co/XweGGOWIIEN123K",
		"replies": ...
	},
	{
		"type": "Note",
		"id": "me",
		"origin": "https://www.facebook.com",
		"content": "薬学博士とかいないかな",
		"published": "Thu Apr 06",
		"url":"https://fb.com/53/2",
		"replies": ...
	},
]

const tw = [
	{
		"created_at"        : "Thu Apr 06 15:28:43 +0000 2017",
		"id"                : 850007368138018817,
		"id_str"            : "850007368138018817",
		"text"              : "RT @TwitterDev: 1/ Today we’re sharing our vision for the future of the Twitter API platform!nhttps://t.co/XweGngmxlP",
		"truncated"         : false,
		"entities"          : {
			"urls": [
				{
					"url"         : "https://t.co/XweGngmxlP",
					"expanded_url": "https://cards.twitter.com/cards/18ce53wgo4h/3xo1c",
					"display_url" : "cards.twitter.com/cards/18ce53wg…",
				}
			]
		},
		"source"            : "<a href=\"http: //twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
		"user"              : {
			"id"    : 6253282,
			"id_str": "6253282",
			"name"  : "Twitter API",
		},
		"retweet_count"     : 284,
		"favorite_count"    : 0,
		"favorited"         : false,
		"retweeted"         : false,
		"possibly_sensitive": false,
		"lang"              : "en",
	},
]

const fb = [
	{
		"id"           : "2204947503165947_2160204937640204",
		"message"      : "近くに薬学博士とかいないかな",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2160204937640204"
	},
	{
		"id"           : "2204947503165947_2160204364306928",
		"message"      : "みす。忘れてた。行けばよかった。",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2160204364306928"
	},
	{
		"id"           : "2204947503165947_2156456638015034",
		"message"      : "おれってアメとムチ使い分けててえらいっ！って思い込んでしまっている其の実、ただの気分の起伏の波に付き合わされてるだけと受け取られることもあるという自戒",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2156456638015034"
	},
	{
		"id"           : "2204947503165947_2141411542852877",
		"message"      : "あ！",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2141411542852877"
	},
	{
		"id"           : "2204947503165947_2126029354391096",
		"message"      : `話題の[世界を変えた書物]展💁‍♂️

		知識として知っていたものを実際に目の当たりにすると「はあ！これか！」って、ついニヤケてしまう`,
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2126029354391096"
	},
	{
		"id"           : "2204947503165947_2123245228002842",
		"message"      : "本日はこちら💁‍♂️",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2123245228002842"
	},
	{
		"id"           : "2204947503165947_2117118958615469",
		"message"      : "既視感〜",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2117118958615469"
	},
	{
		"id"           : "2204947503165947_2114055928921772",
		"message"      : `会津はよさげ

	`,
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2114055928921772"
	},
	{
		"id"           : "2204947503165947_2112237832436915",
		"message"      : "now!",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2112237832436915"
	},
	{
		"id"           : "2204947503165947_2111130575880974",
		"message"      : "左が完全安静状態での測定。右が作業状態での測定。これはなかなか...?",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2111130575880974"
	},
	{
		"id"           : "2204947503165947_2111125015881530",
		"message"      : "これはアロマテラピーハックが捗るものではないか！",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2111125015881530"
	},
	{
		"id"           : "2204947503165947_2109763646017667",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2109763646017667"
	},
	{
		"id"           : "2204947503165947_2108036619523703",
		"message"      : "CrankWheel便利かも！普通の画面共有ツールではあるんだが、閲覧者はただブラウザがあれば共有画面が見られる。なんの用意もなしに。スマホでもOK。",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2108036619523703"
	},
	{
		"id"           : "2204947503165947_2098783173782381",
		"message"      : "果たしてCDOを誰が務めるのか..！",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2098783173782381"
	},
	{
		"id"           : "2204947503165947_2085611855099513",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2085611855099513"
	},
	{
		"id"           : "2204947503165947_2085493811777984",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2085493811777984"
	},
	{
		"id"           : "2204947503165947_2081629402164425",
		"message"      : "oh...",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2081629402164425"
	},
	{
		"id"           : "2204947503165947_2074943682832997",
		"message"      : "約一ヶ月半、プロダクト開発のために東京にいたけれど、地方にとんでくるエンジニアの気持ちがいまならちょっとだけわかるの。",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2074943682832997"
	},
	{
		"id"           : "2204947503165947_2045737042420328",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2045737042420328"
	},
	{
		"id"           : "2204947503165947_2028512537476112",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2028512537476112"
	},
	{
		"id"           : "2204947503165947_2028016960859003",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2028016960859003"
	},
	{
		"id"           : "2204947503165947_2020613741599325",
		"message"      : "' z 'キーが反応しなくなってしまい大ピンチ",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2020613741599325"
	},
	{
		"id"           : "2204947503165947_2019101935083839",
		"message"      : "こんなゴツゴツゴリッゴリな感じのラインナップで「乗り換え応援❤️」なんてギャップ萌え",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2019101935083839"
	},
	{
		"id"           : "2204947503165947_2018755461785153",
		"message"      : "夜の会津に繰り出すと、まさかの徳納 弘和おじちゃん",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2018755461785153"
	},
	{
		"id"           : "2204947503165947_2016460748681291",
		"message"      : "そういえば、きょうのお昼にいった定食屋さんにて、「お兄ちゃんコーヒー飲むかい？」ってコーヒーを頂いたんですけれども、こういうのがあるからローカル店はやめられないよね",
		"permalink_url": "https://www.facebook.com/2204947503165947/posts/2016460748681291"
	}
];

// https://service.infocom.co.jp/das/loddiary/2015/01/20150127001259.html
const act = {
	"@context": {
		"@base"  : "https://www.facebook.com/2204947503165947/posts/",
		"note"   : "https://www.w3.org/ns/activitystreams#Note",
		"value"  : "http://www.w3.org/1999/02/22-rdf-syntax-ns#value",
		"uri"    : "@id",
		"like"   : "@id",
		"post"   : "@graph",
		"comment": "$graph",
	},
	"post"    : [
		{
			"id"       : "2160204937640204",
			"permalink": "https://www.facebook.com/2204947503165947/posts/2160204937640204",
			"note"     : "近くに薬学博士とかいないかな",
			"comment"  : [
				{
					"user" : "Mr. XXX",
					"value": "hogehoge"
				}
			],
			"like"     : [
				"Mr. XXX", "Ms. YYY"
			],
			"created"  : '2019-01-17T00:00:00',
			"modified" : '2019-01-17T00:00:00',
		},
		{
			"id"       : "2160204364306928",
			"permalink": "https://www.facebook.com/2204947503165947/posts/2160204364306928",
			"note"     : "みす。忘れてた。行けばよかった。",
			"comment"  : [
				{
					"user" : "Mr. HOGE",
					"value": "hogehoge"
				}
			],
			"like"     : [
				"Mr. HOGE",
			],
			"created"  : '2019-01-17T00:00:00',
			"modified" : '2019-01-17T00:00:00',
		},
	],
	filename  : 'index.ttl',
	title     : 'This is title',
	created   : '2019-01-17T00:00:00',
	modified  : '2019-01-17T00:00:00',
	body      : 'This is a body',
	author    : 0,
}


makePost( authors, act )

function makePost( authors, act ) {
	const g = $rdf.graph()
	const containerURI = `${webId}/public/Test/`
	const indexURI = `${containerURI}activity.ttl`

	// store.add( $rdf.sym(container), DCT( 'title' ), $rdf.lit( post.title ) );
	// store.add( $rdf.sym(container), SIOC( 'has_creator' ), $rdf.sym( `${container}#author` ) );
	g.add( g.sym( `${indexURI}` ), RDF( 'type' ), ACT( 'Activity' ) );
	g.add( g.sym( `${indexURI}` ), DCT( 'created' ), $rdf.lit( act.created, '', XSD( 'dateTime' ) ) );
	g.add( g.sym( `${indexURI}` ), DCT( 'modified' ), $rdf.lit( act.modified, '', XSD( 'dateTime' ) ) );

	for( let a of act.post ) {
		const it = g.sym( `${indexURI}#${a.id}` )
		g.add( it, RDF( 'type' ), ACT( 'Note' ) );
		g.add( it, SIOC( 'link' ), a.permalink )
		g.add( it, ACT( 'content' ), a.note ) // encode html
		g.add( it, ACT( 'Comment' ), a.comment ) // use blank node
		g.add( it, ACT( 'Like' ), a.like )
		g.add( it, DCT( 'created' ), $rdf.lit( a.created, '', XSD( 'dateTime' ) ) );
		g.add( it, DCT( 'modified' ), $rdf.lit( a.modified, '', XSD( 'dateTime' ) ) );
	}
	// store.add( container, SIOC( 'content' ), $rdf.lit( act ) );
	// store.add( $rdf.sym( `${container}#author` ), RDF( 'type' ), SIOC( 'UserAccount' ) );
	// store.add( $rdf.sym( `${container}#author` ), SIOC( 'account_of' ), $rdf.sym( post.author ) );
	// store.add( $rdf.sym( `${container}#author` ), FOAF( 'name' ), $rdf.lit( authors[ post.author ].name ) );
	// store.add( $rdf.sym( `${container}#author` ), SIOC( 'avatar' ), $rdf.sym( authors[ post.author ].picture ) );

	let triples = new $rdf.Serializer( g ).setBase( indexURI ).toN3( g )
	const post = {
		body    : triples,
		filename: act.filename
	}
	debugger
	createPost( containerURI, post )

	getPost( indexURI )

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

function getPost( uri, store ) {
	const g = $rdf.graph();
	const fetcher = new $rdf.Fetcher( g, timeout )

	fetcher.load( uri ).then( response => {
		debugger
		// let name = store.any(me, VCARD('fn'));
		// console.log(`Loaded ${name || 'wot no name?'}`);
	}, err => {
		debugger
		console.log( "Load failed " + err );
	} );

	// fetcher.fetchUri( uri )
	// .then( ( res ) => {
	// 	debugger
	// } )
	// .catch( ( err ) => {
	// 	debugger
	// } )
}