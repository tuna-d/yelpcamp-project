const express = require("express")
const router = express.Router()
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const { storeReturnTo, isUsersProfile, isLoggedIn } = require("../middleware")

const multer = require("multer")
const { storage } = require("../cloudinary")
const upload = multer({ storage })

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

router.get(
  "/profile/:userId/edit",
  isLoggedIn,
  isUsersProfile,
  catchAsync(user.editProfileForm)
)
router
  .route("/profile/:userId")
  .get(catchAsync(user.showProfile))
  .put(
    isLoggedIn,
    isUsersProfile,
    upload.single("profilePic"),
    catchAsync(user.editProfile)
  )

module.exports = router
