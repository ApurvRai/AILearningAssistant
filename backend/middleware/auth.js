import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  //Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; //Get token from header

      //Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password"); //Attach user to request, exclude password

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
          statusCode: 401,
        });
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Token expired",
          statusCode: 401,
        });
      }

      return res.status(401).json({
        success: false,
        error: "Not authorized, no token",
        statusCode: 401,
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token",
      statusCode: 401,
    });
  }
};

export default protect;
