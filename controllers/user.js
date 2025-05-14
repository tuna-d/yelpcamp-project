const User = require("../models/user")
const Campgroud = require("../models/campground")

module.exports.renderRegisterUser = (req, res) => {
  res.render("users/register")
}

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    const user = await new User({ username, email })
    const registeredUser = await User.register(user, password)
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err)
      }
      req.flash("success", "Welcome to YelpCamp!")
      res.redirect("/campgrounds")
    })
  } catch (e) {
    req.flash("error", e.message)
    res.redirect("/register")
  }
}

module.exports.renderLogin = (req, res) => {
  res.render("users/login")
}

module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome back.")
  const redirectUrl = res.locals.returnTo || "/campgrounds"
  delete req.session.returnTo
  res.redirect(redirectUrl)
}

module.exports.logoutUser = (req, res, next) => {
  req.logOut(function (e) {
    if (e) {
      return next(e)
    }
    req.flash("success", "Successfully logged out.")
    res.redirect("/campgrounds")
  })
}

module.exports.showProfile = async (req, res) => {
  const { userId } = req.params
  const findUser = await User.findById(userId)
  const userCamps = await Campgroud.find({ author: userId })
  res.render("users/profile", { findUser, userCamps })
}

module.exports.editProfileForm = async (req, res) => {
  const { userId } = req.params
  const findUser = await User.findById(userId)
  res.render("users/edit", { findUser })
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
  res.redirect(`/profile/${userId}`)
}
