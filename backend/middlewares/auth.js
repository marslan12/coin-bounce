const JWTService = require("../services/JWTService");
const User = require("../models/user");
const UserDTO = require("../dto/user");

const auth = async (req, res, next) => {
  try {
    //Check for accecc and refresh tokens
    const { accessToken, refreshToken } = req.cookies;
    if (!accessToken || !refreshToken) {
      const error = {
        status: 400,
        message: "Unauthorized",
      };

      return next(error);
    }

    //Get user details from database
    const _id = JWTService.verifyAccessToken(accessToken)._id;
    const user = await User.findOne({ _id });
    req.user = new UserDTO(user);

    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = auth;
