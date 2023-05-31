const jwt = require('jsonwebtoken'); // auth
const jwksClient = require('jwks-rsa'); // auth

// This is a special function for express called "Middleware"
// We can simply "use()" this in our server
// When a user is validated, request.user will contain their information
// Otherwise, this will force an error
async function verifyUser(request, response, next) {
  function valid(err, user) {
    request.user = user;
    next();
  }

  try {
    const token = request.headers.authorization.split(' ')[1];
    let key = await getKey()
    jwt.verify(token, key, {}, valid);
  } catch (error) {
    next('Not Authorized');
  }
}


// =============== HELPER METHODS, pulled from the jsonwebtoken documentation =================== //
//                 https://www.npmjs.com/package/jsonwebtoken                                     //

// Define a client, this is a connection to YOUR auth0 account, using the URL given in your dashboard
const client = jwksClient({
  // this url comes from your app on the auth0 dashboard
  jwksUri: process.env.JWKS_URI,
});
// Match the JWT's key to your Auth0 Account Key so we can validate it
async function getKey(header, callback) {
  console.log("header", header)
  const kid = 'JRS9S7Yh-sbKlQZ2FeZUB';
  let key = await client.getSigningKey(kid);
  return key
}



module.exports = verifyUser;