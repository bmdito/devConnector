const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    POST api/posts
// @desc     Create a post
// @access   Private

router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);

    // if there are errors!
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    try {
        //because logged in we have token that gets put in req.user.id
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            // name and avatar come from the user object
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        // puts the new post in the variable
        const post = await newPost.save();

        //return saved post in variable above
        res.json(post);

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }



});

// @route    GET api/posts
// @desc     Get all posts
// @access   Private

router.get("/", auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        });
        res.json(posts);

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});

// @route    GET api/posts/:id
// @desc     Get Post by id
// @access   Private

router.get("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }

        res.json(post);

    } catch (err) {
        console.log(err.message);
        // check if its not a formatted Object Id
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.status(500).send('Server Error')
    }
});

// @route    DELETE api/posts/:id
// @desc     Delete a Post
// @access   Private

router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //if post doesnt exist
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }

        // check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            })
        }

        await post.remove();
        res.json({
            msg: 'Post removed'
        });

    } catch (err) {
        console.log(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.status(500).send('Server Error')
    }
});


module.exports = router;