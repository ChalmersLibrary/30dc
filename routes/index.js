var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.render('index', { user:req.user });
  } else {
    res.redirect("/info");
  }
});

router.get("/info", function(req, res, next) {
  res.render("info", { user:req.user });
});

module.exports = router;
