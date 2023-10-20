const jwt = require("jsonwebtoken");
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require("../config/index,js");
const RefreshToken = require("../models/token");

class JWTService {
  static signAccessToken(_id) {
    return jwt.sign({ _id }, ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
  }

  static signRefreshToken(_id) {
    return jwt.sign({ _id }, REFRESH_TOKEN_SECRET, { expiresIn: "60m" });
  }

  static verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  }

  static verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  }

  static async saveRefreshToken(token, userId) {
    try {
      const newToken = new RefreshToken({
        token,
        userId,
      });

      await newToken.save();
    } catch (error) {
      console.log(error);
    }
  }

  static async updateRefreshToken(token, userId) {
    try {
      await RefreshToken.updateOne({ userId }, { token }, { upsert: true });
    } catch (error) {
      console.log(error);
    }
  }

  static async deleteRefreshToken(token) {
    try {
      await RefreshToken.deleteOne({ token });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = JWTService;
