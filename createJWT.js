const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createToken = function(fn, ln, id) {
  return _createToken(fn, ln, id);
}

_createToken = function(fn, ln, id) {

  try {

    const expiration = new Date();

    const user = {
      userID: id,
      firstName: fn,
      lastName: ln
    };

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

    ret = {
      accessToken: accessToken,
      fn: fn,
      ln: ln,
      id: id
    };

  } catch (e) {
    ret = { error: e.message };
  }

  return ret;
}

exports.isExpired = function(token) {

  var isError = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, verifiedJwt) => {
    return err;
  });

  return isError;
}

exports.refresh = function(token) {

  var ud = jwt.decode(token, {
    complete: true
  });

  var userId = ud.payload.id;
  var firstName = ud.payload.firstName;
  var lastName = ud.payload.lastName;

  return _createToken(firstName, lastName, userId);
}