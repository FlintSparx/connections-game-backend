import jwt from "jsonwebtoken";

const tokenChecker = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    } else {
      //if the token includes Bearer, split to array and grab index 1
      if (token.includes("Bearer")) token = token.split(" ")[1];

      //verify the token
      const tokenMatch = jwt.verify(token, process.env.JWT_KEY);

      if (!tokenMatch) {
        return res.status(401).send("Access denied. Invalid token.");
      } else {
        //add the info from the token to the request under user ex. req.user.userID to check chat room user access
        req.user = tokenMatch;
        next();
      }
    }
  } catch (err) {
    console.error(err);
    if (err.name === "TokenExpiredError") {
      res.status(401).send("Access denied. Token has expired.");
    } else if (err.name === "JsonWebTokenError") {
      res.status(401).send("Access denied. Invalid token.");
    } else {
      res.status(500).send(`unknown error: ${err}`);
    }
  }
};

export default tokenChecker;
