const Joi = require("joi");
const fs = require("fs");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { BACKEND_SERVER_PATH } = require("../config/index,js");
const BlogDetailDTO = require("../dto/blogDetail");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  async create(req, res, next) {
    //Input validation
    const blogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      photo: Joi.string(),
      author: Joi.string().regex(mongodbIdPattern).required(),
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
      const blog = await Blog.findById({ _id }).populate("author");

      const blogDetailDTO = new BlogDetailDTO(blog);

      res.status(200).json({ blog: blogDetailDTO });
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    //Input validation
    const blogSchema = Joi.object({
      _id: Joi.string().regex(mongodbIdPattern).required(),
      title: Joi.string(),
      content: Joi.string(),
      photo: Joi.string(),
    });
    const { error } = blogSchema.validate(req.body);

    if (error) {
      return next(error);
    }
    const { _id, title, content, photo } = req.body;

    //Get blog from database
    let blog;
    try {
      blog = await Blog.findById({ _id });
    } catch (error) {
      return next(error);
    }

    if (blog) {
      if (photo) {
        //Delete previous and upload new photo
        const previousPhoto = blog.photoPath.split("/").at(-1);
        fs.unlinkSync(`storage/${previousPhoto}`);

        //Read as buffer
        const buffer = Buffer.from(
          photo.replace(/^data:image\/(png|jpg|jpeg):base64,/, ""),
          "base64"
        );

        const imageName = `${Date.now()}-${blog.author}.png`;

        try {
          fs.writeFileSync(`storage/${imageName}`, buffer);
        } catch (error) {
          return next(error);
        }

        await Blog.updateOne(
          { _id },
          {
            title,
            content,
            photoPath: `${BACKEND_SERVER_PATH}/storage/${imageName}`,
          }
        );
      } else {
        await Blog.updateOne({ _id }, { title, content });
      }
    } else {
      const error = {
        status: 404,
        message: "Blog not found",
      };
      return next(error);
    }
    res.status(200).json({ message: "Blog updated successfully" });
  },

  async delete(req, res, next) {
    const _id = req.params.id;
    try {
      const blog = await Blog.findById({ _id });
      if (blog) {
        //Delete photo
        const previousPhoto = blog.photoPath.split("/").at(-1);
        fs.unlinkSync(`storage/${previousPhoto}`);

        //Delete blog and comments from database
        await Blog.deleteOne({ _id });
        await Comment.deleteMany({ blog: _id });
      } else {
        const error = {
          status: 404,
          message: "Blog not found",
        };
        return next(error);
      }
      res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = blogController;
