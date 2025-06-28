const User = require("../models/user")
const Campgroud = require("../models/campground")
const Follow = require("../models/follow")

module.exports.renderRegisterUser = (req, res) => {
  return res.render("users/register")
}

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    const user = await new User({ username, email })
    const registeredUser = await User.register(user, password)
    registeredUser.profilePic = {
      url: "https://res.cloudinary.com/dirdof2ca/image/upload/c_thumb,g_face,h_164,w_164/v1747238909/blank-profile-picture-973460_1920_usz8ox.png",
      filename: "default",
    }
    await registeredUser.save()
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err)
      }
      req.flash("success", "Welcome to YelpCamp!")
      return res.redirect("/campgrounds")
    })
  } catch (e) {
    req.flash("error", e.message)
    return res.redirect("/register")
  }
}

module.exports.renderLogin = (req, res) => {
  return res.render("users/login")
}

module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome back.")
  const redirectUrl = res.locals.returnTo || "/campgrounds"
  delete req.session.returnTo
  return res.redirect(redirectUrl)
}

module.exports.logoutUser = (req, res, next) => {
  req.logOut(function (e) {
    if (e) {
      return next(e)
    }
    req.flash("success", "Successfully logged out.")
    return res.redirect("/campgrounds")
  })
}

module.exports.showProfile = async (req, res) => {
  const { userId } = req.params
  const findUser = await User.findById(userId)
  const userCamps = await Campgroud.find({ author: userId })
  const following = await Follow.find({ follower: userId }).populate(
    "following"
  )
  const followers = await Follow.find({ following: userId }).populate(
    "follower"
  )
  const isFollowing = req.user
    ? await Follow.exists({
        follower: req.user.id,
        following: userId,
      })
    : null
  return res.render("users/profile", {
    findUser,
    userCamps,
    isFollowing,
    followers,
    following,
  })
}

module.exports.editProfileForm = async (req, res) => {
  const { userId } = req.params
  const findUser = await User.findById(userId)
  return res.render("users/edit", { findUser })
}

module.exports.editProfile = async (req, res) => {
  const { userId } = req.params
  const user = await User.findByIdAndUpdate(
    userId,
    {
      username: req.body.username,
    },
    { runValidators: true }
  )
  if (req.file) {
    user.profilePic = {
      url: req.file.path.replace(
        "/upload",
        "/upload/c_thumb,g_face,h_164,w_164"
      ),
      filename: req.file.filename,
    }
  }
  await user.save()
  console.log(user)
  return res.redirect(`/profile/${userId}`)
}

module.exports.follow = async (req, res) => {
  const follower = req.user.id
  const following = req.params.userId
  const follow = await new Follow({ follower, following })
  await follow.save()
  const followingUsername = await User.findById(following)
  req.flash("success", `You're now following ${followingUsername.username}!`)
  return res.redirect(`/profile/${following}`)
}

module.exports.unfollow = async (req, res) => {
  const follower = req.user.id
  const following = req.params.userId
  await Follow.findOneAndDelete({
    follower,
    following,
  })
  const { source } = req.query
  source === "follow_list"
    ? res.redirect(`/profile/${follower}/follow`)
    : res.redirect(`/profile/${following}`)
}

module.exports.showFollowers = async (req, res) => {
  const { userId } = req.params
  const findUser = await User.findById(userId)
  const following = await Follow.find({ follower: userId }).populate(
    "following"
  )
  const followers = await Follow.find({ following: userId }).populate(
    "follower"
  )
  const isFollowing = req.user
    ? await Follow.exists({
        follower: req.user.id,
        following: userId,
      })
    : null
  return res.render("users/followers", {
    findUser,
    isFollowing,
    followers,
    following,
  })
}
