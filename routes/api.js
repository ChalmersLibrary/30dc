const express = require('express');
const router = express.Router();
const fs = require("fs");
const crypto = require("crypto");

router.post("/", function(req, res, next) {
  let user = req.user || { id:"dummy" };
  if ((!process.env.USE_SAML || req.isAuthenticated()) && typeof user.id !== "undefined") {
    let hash = crypto.createHash("sha256");
    let obfuscatedId = hash.update(user.id).digest("hex");
    fs.mkdirSync(process.env.SAVE_LOCATION, { recursive: true });
    fs.writeFileSync(process.env.SAVE_LOCATION + "/" + obfuscatedId, JSON.stringify(req.body));
  } else {
    res.status(500).send("Auth error");
  }
});

router.get("/", function(req, res, next) {
  let user = req.user || { id:"dummy" };
  if ((!process.env.USE_SAML || req.isAuthenticated()) && typeof user.id !== "undefined") {
    try {
      let hash = crypto.createHash("sha256");
      let obfuscatedId = hash.update(user.id).digest("hex");
      let userData = fs.readFileSync(process.env.SAVE_LOCATION + "/" + obfuscatedId, "utf-8");
      res.json(JSON.parse(userData));
    } catch (error) {
      if (error.message.indexOf("ENOENT") > -1) {
        // We found no data but it's ok.
        res.json({});
      } else {
        console.log("Load data error: ", error);
        res.status(500).send("Load data serror.");
      }
    }
  } else {
    res.status(500).send("Auth error");
  }
});

module.exports = router;
