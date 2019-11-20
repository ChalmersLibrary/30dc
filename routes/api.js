const express = require('express');
const router = express.Router();
const fs = require("fs");

const ANIMALS = [
  "cat",
  "dog",
  "lion",
  "panda",
  "walrus",
  "otter",
  "turtle",
  "mouse",
  "fish",
  "rabbit",
  "cow",
  "pig",
  "deer",
  "bee",
  "dove"
]

let generateId = function() {
  let id = "";
  while (!id) {
    id = ANIMALS[Math.floor(Math.random()*ANIMALS.length)] + 
      Math.floor(Math.random()*100).toString().padStart(2, "0");
    try {
      fs.writeFileSync(process.env.SAVE_LOCATION + "/" + 
        id, "{}", { flag: "wx" });
    } catch (error) {
      id = "";
    }
  }
  return id;
}

let saveData = function(req, res) {
  try {
    let userId = req.params.id;

    fs.mkdirSync(process.env.SAVE_LOCATION, { recursive: true });
  
    if (!userId) {
      userId = generateId();
    }
      
    let data = req.body;
    data.userId = userId;
    data.changed = new Date();
    fs.writeFileSync(process.env.SAVE_LOCATION + "/" + userId, JSON.stringify(data));
    res.json(data);
  } catch (error) {
    res.status(500).send("Encountered error when saving user data.");
    console.error("Encountered error when saving user data: ", error);
  }
}

router.post("/user", function(req, res) {
  saveData(req, res);
});

router.post("/user/:id", function(req, res) {
  saveData(req, res);
});

router.get("/user/:id", function(req, res, next) {
  if (req.params.id) {
    try {
      let userData = fs.readFileSync(process.env.SAVE_LOCATION + 
        "/" + req.params.id);
      res.json(JSON.parse(userData));
    } catch (error) {
      if (error.message.indexOf("ENOENT") > -1) {
        // We found no data but it's ok.
        res.status(404).send("User data not found.");
      } else {
        console.log("Load data error: ", error);
        res.status(500).send("Load data serror.");
      }
    }
  } else {
    res.status(404).send("User data not found.");
  }
});

module.exports = router;
