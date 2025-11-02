const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// session on /customer
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  })
);

// protect ONLY the /customer/auth/* paths
app.use("/customer/auth/*", (req, res, next) => {
  // Expect: req.session.authorization = { token, username }
  if (!req.session || !req.session.authorization) {
    return res.status(403).json({ message: "Unauthorized: missing session" });
  }
  const token = req.session.authorization.token;
  jwt.verify(token, "access", (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Unauthorized: invalid token" });
    }
    // expose username for downstream routes
    req.username = payload.username;
    next();
  });
});

const PORT = 5000;
app.use("/customer", customer_routes); // login + protected review routes
app.use("/", genl_routes);             // public routes + register

app.listen(PORT, () => console.log("Server is running"));
