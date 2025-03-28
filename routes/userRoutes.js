const express = require("express")
const router = express.Router()
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const { storeReturnTo } = require("../middleware")

router.get("/register", (req, res) => {
  res.render("users/register")
})

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
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
  })
)

router.get("/login", (req, res) => {
  res.render("users/login")
})

router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back.")
    const redirectUrl = res.locals.returnTo || "/campgrounds"
    delete req.session.returnTo
    res.redirect(redirectUrl)
  }
)

router.get("/logout", (req, res, next) => {
  req.logOut(function (e) {
    if (e) {
      return next(e)
    }
    req.flash("success", "Successfully logged out.")
    res.redirect("/campgrounds")
  })
})

module.exports = router
