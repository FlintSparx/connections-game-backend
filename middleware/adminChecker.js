import jwt from "jsonwebtoken";

const adminChecker = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token.includes("Bearer")) token = token.split(" ")[1];
    const tokenMatch = jwt.verify(token, process.env.JWT_KEY);
    const isAdmin = tokenMatch.isAdmin;
    if (!isAdmin) {
      return res.status(401).send("Access denied. You are not an admin.");
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(`unknown error: ${err}`);
  }
};

export default adminChecker;
