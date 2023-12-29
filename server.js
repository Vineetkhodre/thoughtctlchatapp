// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

// Create a Nexmo client
const Nexmo = require("nexmo");
const nexmo = new Nexmo(
  {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    applicationId: process.env.APP_ID,
    privateKey: __dirname + process.env.PRIVATE_KEY,
  },
  { debug: true }
);

// Express app setup
const app = express();
app.use(bodyParser.json());

// Define routes start

// the client calls this endpoint to get a JWT for thr user in the Nexmo application
app.post("/getJWT", (req, res) => {
  const jwt = nexmo.generateJwt({
    application_id: process.env.APP_ID,
    sub: req.body.name,
    exp: Math.round(new Date().getTime() / 1000) + 86400,
    acl: {
      paths: {
        "/*/rtc/**": {},
        "/*/users/**": {},
        "/*/conversations/**": {},
        "/*/sessions/**": {},
        "/*/devices/**": {},
        "/*/image/**": {},
        "/*/media/**": {},
        "/*/knocking/**": {},
        "/*/legs/**": {},
      },
    },
  });
  res.send({ jwt: jwt });
});

// the client calls this endpoint to get a create new users in the Nexmo application
app.post("/createUser", (req, res) => {
  nexmo.users.create(
    {
      name: req.body.name,
      display_name: req.body.display_name || req.body.name,
    },
    (err, response) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.send({ id: response.id });
      }
    }
  );
});

app.post("/createMember", (req, res) => {
  nexmo.conversations.members.create(
    req.body.conversationId,
    { action: "join", user_id: req.body.userId, channel: { type: "app" } },
    (err, response) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.send(response);
      }
    }
  );
});

// the client calls this endpoint to get a list of all users in the Nexmo application
app.get("/getUsers", function (req, res) {
  const users = nexmo.users.get({}, (err, response) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send({ users: response });
    }
  });
});
// Define routes end

//Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
