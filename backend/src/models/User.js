import mongoose from "mongoose";
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  uid: { type: String, unique: true, required: true }, // firebase uid
  email: String,
  roles: { type: [String], default: ["learner"] },
  avatar: String,
  skills: { type: [String], default: [] },
  xp: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
