var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.user || { id:"dummy" };
  if (!process.env.USE_SAML || req.isAuthenticated()) {
    res.render('index', { user:user });
  } else {
    res.redirect("/info");
  }
});

router.get("/info", function(req, res, next) {
  let user = req.user || { id:"dummy" };
  res.render("info", { user:user });
});

module.exports = router;
