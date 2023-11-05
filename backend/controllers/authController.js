const Joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");

const COOKIE_RESPONSE = {
  maxAge: 1000 * 60 * 60 * 24,
  httpOnly: true,
};

const authController = {
  //////// Method For Register New User /////////
  async register(req, res, next) {
    //Input Validations
    const userRegisterSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.ref("password"),
    });

    const { error } = userRegisterSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { name, username, email, password } = req.body;

    //Check for duplicate record
    const isUserNameExist = await User.exists({ username });
    const isEmailExist = await User.exists({ email });

    try {
      if (isUserNameExist) {
        const error = {
          status: 409,
          message: "Username already exists",
        };

        return next(error);
      }

      if (isEmailExist) {
        const error = {
          status: 409,
          message: "Email already exists",
        };

        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    //Insert new user with hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    let accessToken;
    let refreshToken;

    let user;
    try {
      const userToRegister = new User({
        name,
        email,
        username,
        password: hashedPassword,
      });

      user = await userToRegister.save();
    } catch (error) {
      return next(error);
    }

    //Sign and Save Access and Refresh tokens in database
    accessToken = await JWTService.signAccessToken(user._id);
    refreshToken = await JWTService.signRefreshToken(user._id);
    await JWTService.saveRefreshToken(refreshToken, user._id);

    //Send response with Access and Refresh tokens
    res.cookie("accessToken", accessToken, COOKIE_RESPONSE);

    res.cookie("refreshToken", refreshToken, COOKIE_RESPONSE);

    const userDTO = new UserDTO(user);
    return res.status(201).json({ user: userDTO, auth: true });
  },

  //////// Method For Login //////////
  async login(req, res, next) {
    const { username, password } = req.body;

    let user;
    try {
      user = await User.findOne({ username });

      if (!user) {
        const error = {
          status: 401,
          message: "Invalid username",
        };

        return next(error);
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: "Invalid password",
        };

        return next(error);
      }

      //Sign and update Access and Refresh tokens in database
      const accessToken = JWTService.signAccessToken(user._id);
      const refreshToken = JWTService.signRefreshToken(user._id);
      await JWTService.updateRefreshToken(refreshToken, user._id);

      //Send response with Access and Refresh tokens
      res.cookie("accessToken", accessToken, COOKIE_RESPONSE);

      res.cookie("refreshToken", refreshToken, COOKIE_RESPONSE);

      const userDTO = new UserDTO(user);
      return res.status(200).json({ user: userDTO, auth: true });
    } catch (error) {
      return next(error);
    }
  },

  /////// Method For Logout //////////
  async logout(req, res, next) {
    //Delete Refresh token from database
    const { refreshToken } = req.cookies;
    await JWTService.deleteRefreshToken(refreshToken);

    //Delete cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    //Send response
    res.status(200).json({ user: null, auth: false });
  },

  ////// Method For Refresh Token /////////
  async refresh(req, res, next) {
    //Verify previous refresh token
    const previousRefreshToken = req.cookies.refreshToken;
    let _id;
    try {
      _id = JWTService.verifyRefreshToken(previousRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };

      return next(error);
    }

    //Sign and update Access and Refresh tokens in database
    const accessToken = JWTService.signAccessToken(_id);
    const newRefreshToken = JWTService.signRefreshToken(_id);
    await JWTService.updateRefreshToken(newRefreshToken, _id);

    //Send response with Access and Refresh tokens
    res.cookie("accessToken", accessToken, COOKIE_RESPONSE);

    res.cookie("refreshToken", newRefreshToken, COOKIE_RESPONSE);

    let user;
    try {
      user = await User.findById({ _id });
    } catch (error) {
      return next(error);
    }
    const userDTO = new UserDTO(user);

    return res.status(200).json({ user: userDTO, auth: true });
  },
};

module.exports = authController;
