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

module.exports = router;