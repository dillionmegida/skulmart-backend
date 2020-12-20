import AdminInterface from "interfaces/Admin";
import mongoose, { Schema } from "mongoose";

const AdminSchema: Schema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<AdminInterface>("Admin", AdminSchema, "admins");
