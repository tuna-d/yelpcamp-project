const mongoose = require("mongoose")
const Schema = mongoose.Schema
const passportLocalMongoose = require("passport-local-mongoose")

const ProfilePicSchema = new Schema({
  url: String,
  filename: String,
})

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profilePic: ProfilePicSchema,
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema)
