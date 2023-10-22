class BlogDetailDTO {
  constructor(blog) {
    this._id = blog._id;
    this.title = blog.title;
    this.content = blog.content;
    this.photoPath = blog.photoPath;
    this.createdAt = blog.createdAt;
    this.authorName = blog.author.name;
    this.authorUserName = blog.author.userName;
  }
}

module.exports = BlogDetailDTO;
