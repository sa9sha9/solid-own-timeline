function checkSession() {
	// セッション確認
	solid.auth.trackSession( session => {
		if( !session ) {
			console.log( 'The user is not logged in' )
			window.account_uri.textContent = 'Anonymous'
			if( window.login_button.classList.contains( 'hidden' ) ) window.login_button.classList.remove( 'hidden' )
			if( !window.logout_button.classList.contains( 'hidden' ) ) window.logout_button.classList.add( 'hidden' )
		} else {
			console.log( `The user is ${session.webId}` )
			window.account_uri.textContent = session.webId
			if( !window.login_button.classList.contains( 'hidden' ) ) window.login_button.classList.add( 'hidden' )
			if( window.logout_button.classList.contains( 'hidden' ) ) window.logout_button.classList.remove( 'hidden' )
		}
	} )
}
checkSession()

// ログイン
async function popupLogin() {
	console.log( 'login' )
	let session = await solid.auth.currentSession();
	let popupUri = '../component/popup.html';
	if( !session )
		session = await solid.auth.popupLogin( { popupUri } );
	console.log( `The user is ${session.webId}` )
	checkSession()
}

function logout() {
	solid.auth.logout()
	.then( () => {
		console.log('Good bye')
		checkSession()
	} );
}

async function greetUser() {
	const session = await solid.auth.currentSession();
	if( !session )
		alert( 'Hello stranger!' );
	else
		alert( `Hello ${session.webId}!` );
}

// greetUser();