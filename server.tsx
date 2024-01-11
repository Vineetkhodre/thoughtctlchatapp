import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

// Create a Nexmo client
import Nexmo from "nexmo";
const nexmo = new Nexmo({
  apiKey: process.env.API_KEY!,
  apiSecret: process.env.API_SECRET!,
  applicationId: process.env.APP_ID!,
  privateKey: __dirname + process.env.PRIVATE_KEY!,
}, { debug: true });

// Express app setup
const app = express();
app.use(bodyParser.json());

// Define routes start

// the client calls this endpoint to get a JWT for the user in the Nexmo application
app.post("/getJWT", (req: { body: { name: any; }; }, res: { send: (arg0: { jwt: any; }) => void; }) => {
  const jwt = (nexmo as any).generateJwt({
    application_id: process.env.APP_ID!,
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
  res.send({ jwt });
});

// the client calls this endpoint to get create new users in the Nexmo application
app.post("/createUser", (req: { body: { name: any; display_name: any; }; }, res: { sendStatus: (arg0: number) => void; send: (arg0: { id: any; }) => void; }) => {
  nexmo.users.create(
    {
      name: req.body.name,
      display_name: req.body.display_name || req.body.name,
    },
    (err: any, response: any) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.send({ id: response.id });
      }
    }
  );
});

app.post("/createMember", (req: { body: { conversationId: any; userId: any; }; }, res: { sendStatus: (arg0: number) => void; send: (arg0: any) => void; }) => {
  nexmo.conversations.members.create(
    req.body.conversationId,
    { action: "join", user_id: req.body.userId, channel: { type: "app" } },
    (err: any, response: any) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.send(response);
      }
    }
  );
});

// the client calls this endpoint to get a list of all users in the Nexmo application
app.get("/getUsers", (req: any, res: { sendStatus: (arg0: number) => void; send: (arg0: { users: any; }) => void; }) => {
  const users = nexmo.users.get({}, (err: any, response: any) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send({ users: response });
    }
  });
});

// Define routes end

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
