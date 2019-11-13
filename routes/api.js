var express = require('express');
var router = express.Router();
var fs = require("fs");

router.post("/", function(req, res, next) {
  if (req.isAuthenticated() && typeof req.user.id !== "undefined") {
    fs.mkdirSync(process.env.SAVE_LOCATION, { recursive: true });
    fs.writeFileSync(process.env.SAVE_LOCATION + "/" + req.user.id, JSON.stringify(req.body));
  } else {
    res.status(500).send("Auth error");
  }
});

router.get("/", function(req, res, next) {
  if (req.isAuthenticated() && typeof req.user.id !== "undefined") {
    try {
      let userData = fs.readFileSync(process.env.SAVE_LOCATION + "/" + req.user.id, "utf-8");
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
