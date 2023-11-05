class CommentDTO {
  constructor(comment) {
    this._id = comment._id;
    this.content = comment.content;
    this.authorUsername = comment.author.username;
    this.createdAt = comment.createdAt;
  }
}

module.exports = CommentDTO;
