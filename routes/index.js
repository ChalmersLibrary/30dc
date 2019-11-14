const express = require('express');
const router = express.Router();
const fs = require("fs");
const crypto = require("crypto");

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
  let dataPlanAccepted = false;
  if (user.id !== "dummy") {
    try {
      let hash = crypto.createHash("sha256");
      let obfuscatedId = hash.update(user.id).digest("hex");
      let userData = JSON.parse(
        fs.readFileSync(process.env.SAVE_LOCATION + "/" + obfuscatedId, "utf-8"));
      dataPlanAccepted = userData.dataPlanAccepted;
    } catch (error) {
      if (error.message.indexOf("ENOENT") === -1) {
        console.log("Load data error: ", error);
      }
    }
  }
  res.render("info", { user:user, dataPlanAccepted:dataPlanAccepted });
});

module.exports = router;
