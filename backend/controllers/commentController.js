const Joi = require("joi");
const Comment = require("../models/comment");
const CommentDTO = require("../dto/comment");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const commentController = {
  async create(req, res, next) {
    //Input validation
    const commentSchema = Joi.object({
      content: Joi.string().required(),
      blog: Joi.string().regex(mongodbIdPattern).required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = commentSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { content, blog, author } = req.body;

    //Save in DB
    let comment;
    try {
      comment = new Comment({ content, blog, author });
      await comment.save();
    } catch (error) {
      return next(error);
    }

    res.status(201).json({ comment });
  },

  async getAll(req, res, next) {
    const { blog } = req.params;
    let comments = [];
    let commentsDTO = [];
    try {
      comments = await Comment.find({ blog }).populate("author");
    } catch (error) {
      return next(error);
    }

    for (const comment of comments) {
      commentsDTO.push(new CommentDTO(comment));
    }

    res.status(200).json({ data: commentsDTO });
  },
};

module.exports = commentController;
