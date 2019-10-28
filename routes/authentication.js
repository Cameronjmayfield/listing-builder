var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var url = require('url');
var etsy = require('etsy-js');
var etsyClient = etsy.client({
  key : 'j13t03x405kxhr3jkreqxvuu',
  secret: 'g7us1yhyib',
  callbackURL: 'http://localhost:3000/authorise'
});

var app = express.Router();
app.use(cookieParser('secEtsy'));
app.use(session({secret:'verySecret'}));

app.get('/', function(req, res) {
  etsyClient.requestToken(function (err, response) {
    if (err) {
      console.log(err);
      return;
    }
    req.session.token = response.token;
    req.session.sec = response.tokenSecret;
    res.redirect(response.loginUrl);
  });
});


app.get('/authorise', function(req, res) {
  var query = url.parse(req.url, true).query;
  verifier = query.oauth_verifier;
  etsyClient.accessToken(req.session.token, req.session.sec, verifier, function (err, response) {
    req.session.token = response.token;
    req.session.sec = response.tokenSecret;
    res.redirect('/find');
  });
});

app.get('/find', function(req, res) {
  etsyClient.auth(req.session.token, req.session.sec).user("etsyjs").find(function (err, body, headers) {
    if (err) {
      console.log(err);
      return;
    }
    if (body) {
      res.send(body.results[0]);
    }
  });
});




/* GET users listing. */
//router.get('/', function(req, res, next) {
//  console.log(etsyClient)
//  etsyClient.get('/shops/7152363/listings/active', {}, function (err, status, body, headers) {
//    res.send(body); //json object
//  });
//});

module.exports = app;
