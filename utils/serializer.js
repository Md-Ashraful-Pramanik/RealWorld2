function serializeUser(user, token) {
  return {
    user: {
      email: user.email,
      token,
      username: user.username,
      bio: user.bio,
      image: user.image
    }
  };
}

function serializeProfile(profile) {
  return {
    profile: {
      username: profile.username,
      bio: profile.bio,
      image: profile.image,
      following: Boolean(profile.following)
    }
  };
}

function serializeArticle(article) {
  return {
    article: {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tag_list || [],
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      favorited: Boolean(article.favorited),
      favoritesCount: Number(article.favorites_count || 0),
      author: {
        username: article.author_username,
        bio: article.author_bio,
        image: article.author_image,
        following: Boolean(article.following)
      }
    }
  };
}

function serializeArticles(articles) {
  return {
    articles: articles.map((article) => serializeArticle(article).article),
    articlesCount: articles.length
  };
}

function serializeComment(comment) {
  return {
    comment: {
      id: comment.id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      body: comment.body,
      author: {
        username: comment.author_username,
        bio: comment.author_bio,
        image: comment.author_image,
        following: Boolean(comment.following)
      }
    }
  };
}

function serializeComments(comments) {
  return {
    comments: comments.map((comment) => serializeComment(comment).comment)
  };
}

module.exports = {
  serializeUser,
  serializeProfile,
  serializeArticle,
  serializeArticles,
  serializeComment,
  serializeComments
};