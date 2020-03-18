import mongoose from "mongoose";
import{Author} from "./author"; 

export const Post = mongoose.model("Post",new mongoose.Schema({
    title:{
        type: String,
        required: true
      },
    body:{
        type: String,
        required: true
      },
    imageFileName:{
        type: String,
        required: true
      },
    published:{
        type: Boolean,
        required: true
      },
    authors:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: Author
      }]
}));