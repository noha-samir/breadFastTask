import mongoose from "mongoose";
export const Author = mongoose.model("Author",new mongoose.Schema({name: {
    type: String,
    required: true
  }}
));