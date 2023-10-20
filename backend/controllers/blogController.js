const Joi = require("joi");
const fs = require("fs");
const Blog = require("../models/blog");
const { BACKEND_SERVER_PATH } = require("../config/index,js");

const blogControlller = {
  async create(req, res, next) {
    //Input validation
    const blogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      photo: Joi.string(),
      author: Joi.string().required(),
    });
    const { error } = blogSchema.validate(req.body);

    if (error) {
      return next(error);
    }
    const { title, content, photo, author } = req.body;

    //Read as buffer
    const buffer = Buffer.from(
      photo.replace(/^data:image\/(png|jpg|jpeg):base64,/, ""),
      "base64"
    );

    const imageName = `${Date.now()}-${author}.png`;

    try {
      fs.writeFileSync(`storage/${imageName}`, buffer);
    } catch (error) {
      return next(error);
    }

    //Save in database
    let blog;
    try {
      blog = new Blog({
        title,
        content,
        photoPath: `${BACKEND_SERVER_PATH}/storage/${imageName}`,
        author,
      });

      await blog.save();
    } catch (error) {
      return next(error);
    }

    res.status(201).json({ blog });
  },

  async getAll(req, res, next) {
    try {
      const blogs = await Blog.find({});

      res.status(200).json({ blogs });
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    const _id = req.params.id;
    try {
      const blog = await Blog.findById({ _id });

      res.status(200).json({ blog });
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {},

  async delete(req, res, next) {
    const _id = req.params.id;
    try {
      const blog = await Blog.deleteOne({ _id });

      res.status(200).json({ blog });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = blogControlller;
