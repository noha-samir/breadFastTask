import{Author} from "./models/author";
import{Post} from "./models/post";
import { Module } from "module";
const fs = require('fs');
var constants = require("./constants");
const uuidv4 = require('uuid/v4');

export const resolvers = {
    Query:{
        //select all authors.
        authors: ()=> Author.find(),
        //get author by id.
        getAuthor: (_,{id})=> Author.findById(id),
        //select all posts with pagination.
        posts: (_,{pageNum})=> Post.find().skip((pageNum - 1 )* constants.numOfElementsPerPage).limit(constants.numOfElementsPerPage).populate("authors"),
        //get post by id with authors.
        getPost: (_,{id})=> Post.findById(id).populate("authors"),
        //get post with filteration
        getPostByFilter: async (_,{obj}) => Post.find(obj).populate("authors"),
    },
    Mutation: {
        // createAuthor takes 1 parameter {name} then it will be added in Author collection
        createAuthor: async(__dirname, { name })=>{
            const person = new Author({name});
            await person.save();
            return person;
        },
        // createPost takes 5 parameter {title,body,imageFileName,published,arr of authors objects} 
        // if object of the author has id so it is allready exists in authours 
        // else this new authour will be added in authors 
        // then the post will be added 
        createPost: async(_, { title,body,imageFileName,published,authors })=>{
            let listOfAuthors = [];
            let filename;
            imageFileName.then(res =>{
                filename =   (uuidv4()) +'-'+res.filename;
                imageFileName = `${__dirname}/../staticFiles/images/${filename}`;
                const fileStream = res.createReadStream();
                fileStream.pipe(fs.createWriteStream(imageFileName));
            }).catch(err => { throw err});
           
            for (let i = 0; i< authors.length; i++){
                if(authors[i].id){
                    authors[i] = {_id:authors[i].id};
                }else{
                    authors[i] = new Author(authors[i]);
                    listOfAuthors.push(authors[i]);
                }
            }
            await Author.insertMany(listOfAuthors);
            const aPost = new Post({title,body,imageFileName,published,authors});
            await aPost.save();

            return  Post.findById(aPost).populate("authors");
        },
        //get post but filter by authorID
        getPostByAuthorFiltering: async(__dirname, { id })=>{
            return Post.find({authors:id});
        },
       
        //every author can update any post and he/she will be also an author of this post 
        updatePost: async(__dirname, { postID,authorID,title,body,imageFileName,published })=>{
            const oldPost = await Post.findById(postID).populate();
            let newAuthours = oldPost.authors;
            //validate over same author not add it again
            /*for (let i = 0; i < array.length; i++) {
                const element = array[i];
                
            }*/
            newAuthours.push(authorID);
            const update = { title: title, body: body, imageFileName: imageFileName, published: published, authors:newAuthours };
            await oldPost.updateOne(update);

            const updatedPost = await Post.findById(postID).populate("authors");
            return updatedPost;
        },
    }
}