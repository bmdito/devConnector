const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {
    check,
    validationResult
} = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    GET api/profile/me   
// @desc     Gets current users profile
// @access   Private

router.get('/me', auth, async (req, res) => {
    try {
        // gets user from profile model, populate grabs name and avatar from user model
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });
        }

        res.json(profile);

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
});

// @route    POST api/profile/   
// @desc     Create or update a user profile
// @access   Private

router.post('/', [auth, [
        //check that status and skills have been provided
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty()
    ]],
    async (req, res) => {
        //set up error checking results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        //Build social object - must initialize with empty object or it will be undefined
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            //take profile model and find user
            let profile = await Profile.findOne({
                user: req.user.id
            });

            if (profile) {
                //if profile found, update
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                });

                return res.json(profile);
            }

            // if profile not found, Create it
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile);

        } catch (err) {
            res.status(500).send('Server Error')
        }
    }
)

// @route    GET api/profile   
// @desc     Get all profiles
// @access   Private

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// @route    GET api/profile/user/:user_id  
// @desc     Get Profile by user ID
// @access   Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);


        if (!profile)
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });


        res.json(profile);


    } catch (err) {
        console.log(err.message);
        // If the kind of error is ObjectId this is a type
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: 'Profile not Found'
            });
        }
        res.status(500).send('Server Error');
    }
});

// @route    DELETE api/profile   
// @desc     Delete profile, user, & posts
// @access   Private

router.delete('/', auth, async (req, res) => {
    try {
        //@todo - remove users posts

        //Remove profile
        await Profile.findOneAndRemove({
            user: req.user.id
        });
        //Remove user
        await User.findOneAndRemove({
            _id: req.user.id
        });
        res.json({
            msg: 'User Deleted'
        });

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    PUT api/profile/experience   
// @desc     Add profile experience
// @access   Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    //create object with the data the user submits
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        //fetch profile we want to add experience to using id from token
        const profile = await Profile.findOne({
            user: req.user.id
        });

        //creates an array and pushes to beginning
        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
});

module.exports = router;