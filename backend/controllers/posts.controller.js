import Post from "../models/posts.model.js"
import Profile from "../models/profile.model.js"
import User from "../models/user.model.js";
import bcrypt from 'bcrypt';


export const activeCheck = async (req, res) => {
    return res.status(200).json({message: "RUNNING"})
}

export const createPost = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file !== undefined ? req.file.filename : "",
            fileType: req.file !== undefined ? req.file.mimetype.split("/")[0] : ""
        });

        await post.save();

        return res.status(200).json({ message: "Post Created" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export const getAllPosts = async (req, res) => {
  try {

    const posts = await Post.find().populate('userId', 'name email username profilePicture');

    return res.json(posts);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const deletePost = async (req, res) => {
    const { token, post_id } = req.body;

    try {
        // Find user using token
        const user = await User.findOne({ token:token }).select("_id");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find post by ID
        const post = await Post.findOne({ _id: post_id});

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the user is the owner of the post
        if (post.userId.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized: You can only delete your own posts" });
        }

        // Delete post
        await Post.deletePost({id: post_id});

        return res.json({ message: "Post deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const commentPost = async (req, res) => {
    const { token, post_id, commentBody } = req.body;

    try {
        // Verify user
        const user = await User.findOne({ token:token }).select("_id");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find post
        const post = await Post.findOne({ _id: post_id});

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Add comment
        const comment = new Comment({
            userId: user._id,
            postId: post_id,
            comment: commentBody
        });

        await comment.save();

        return res.status(200).json({ message: "Comment added successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const get_comments_by_post = async (req, res) => {
    const { post_id } = req.body;

    try {
        // Check if post exists
        const post = await Post.findOne({ _id: post_id});
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.json({ comments: post.comments });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const delete_comment_of_user = async (req, res) => {
    const { token, comment_id} = req.body;

    try {
        // Verify user
        const user = await User.findOne({ token: token }).select("_id");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the comment
        const comment = await Comment.findOne({"_id": comment_id});
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user is the author of the comment
        if (comment.userId.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized to delete this comment" });
        }

        // Delete the comment
        await Comment.deleteOne({"_id": comment_id});

        return res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const increment_likes = async (req, res) => {
    const {  post_id } = req.body;

    try {

        // Find post
        const post = await Post.findOne({ _id: post_id});
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.likes = post.likes +1;
        await post.save();

        return res.status(200).json({ message: "Post liked successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
