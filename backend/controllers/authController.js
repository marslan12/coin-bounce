const Joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");

const authController = {
  async register(req, res, next) {
    const userRegisterSchema = Joi.object({
      userName: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.ref("password"),
    });

    const { error } = userRegisterSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { name, userName, email, password } = req.body;

    const isUserNameExist = await User.exists({ userName });
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

    const hashedPassword = await bcrypt.hash(password, 10);
    let accessToken;
    let refreshToken;

    let user;
    try {
      const userToRegister = new User({
        name,
        email,
        userName,
        password: hashedPassword,
      });

      user = await userToRegister.save();
      accessToken = JWTService.signAccessToken(
        { _id: user._id, email: user.email },
        "30m"
      );

      refreshToken = JWTService.signAccessToken({ _id: user._id }, "60m");
    } catch (error) {
      return next(error);
    }

    JWTService.saveRefreshToken(refreshToken, user._id);

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    const userDTO = new UserDTO(user);
    return res.status(201).json({ user: userDTO });
  },

  async login(req, res, next) {
    const { userName, password } = req.body;

    let user;
    try {
      user = await User.findOne({ userName });

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

      const userDTO = new UserDTO(user);
      return res.status(200).json({ user: userDTO });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = authController;
