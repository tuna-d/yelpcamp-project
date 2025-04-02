const express = require("express")
const router = express.Router()
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const { storeReturnTo } = require("../middleware")

const user = require("../controllers/user")
router
  .route("/register")
  .get(user.renderRegisterUser)
  .post(catchAsync(user.registerUser))

router
  .route("/login")
  .get(user.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    user.loginUser
  )

router.get("/logout", user.logoutUser)

module.exports = router
