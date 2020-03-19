import{Author} from "./models/author";
import{Post} from "./models/post";

const fs = require('fs');
var constants = require("./constants");
const uuidv4 = require('uuid/v4');

// Upload Image Logic
async function uploadImage(imageFileName){
    let filename;
    await imageFileName.then(res =>{
        filename =   (uuidv4()) +'-'+res.filename;
        imageFileName = `${__dirname}/../staticFiles/images/${filename}`;
        const fileStream = res.createReadStream();
        fileStream.pipe(fs.createWriteStream(imageFileName));
    }).catch(err => { throw err});
    return imageFileName;
}

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
            imageFileName = await uploadImage(imageFileName);

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
       
        // every author can update any post and he/she will be also an author of this post 
        // imageFileName will not be required in the update function if the frontend want to upload anew photo 
        // he/she will pass it else the old image will still be there. 
        updatePost: async(_, { postID,authorID,title,body,imageFileName,published })=>{
            const oldPost = await Post.findById(postID).populate();
            let oldAuthours = oldPost.authors;
            //validate >> already author not add him/her again.
            let newAuthours = [];
            let exist = false;
            for (let i = 0; i < oldAuthours.length; i++) {
                const singleOldAuthor = oldAuthours[i];
                if (singleOldAuthor == authorID){
                    exist = true;
                }
            }
            newAuthours = oldAuthours;
            if(exist == false){
                newAuthours.push(authorID);
            }

            if(imageFileName){
                imageFileName = await uploadImage(imageFileName);
            }else{
                imageFileName = oldPost.imageFileName;
            }

            const update = { title: title, body: body, imageFileName: imageFileName, published: published, authors:newAuthours };
            await oldPost.updateOne(update);

            const updatedPost = await Post.findById(postID).populate("authors");
            return updatedPost;
        },
    }
}