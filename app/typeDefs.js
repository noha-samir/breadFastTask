import {gql} from 'apollo-server-express';
export const typeDefs = gql`
type Query{
    helloWorld: String!
    authors: [Author!]!
    getAuthor(id: ID!): Author!
    posts(pageNum: Int!): [Post!]!
    getPost(id: ID!): Post!
    getPostByFilter(obj:inputPost!):[Post!]!
}

type Author{
    id: ID!
    name: String!
}

input inputAuthor{
    id: ID
    name: String
}

type Post{
    id: ID!
    title: String!
    body: String!
    imageFileName: String! 
    published: Boolean!
    authors: [Author!]!
}

input inputPost{
    id: ID
    title: String
    body: String
    imageFileName: Upload
    published: Boolean
    authors: [inputAuthor]
}

type Mutation{
    createAuthor(name: String!): Author!,
    createPost(title:String!,body:String!,imageFileName:Upload!,published:Boolean!,authors:[inputAuthor!]!): Post!,
    getPostByAuthorFiltering(id: ID!): [Post!]!,
    updatePost(postID:ID! ,authorID:ID! ,title:String! ,body:String! ,imageFileName: Upload ,published:Boolean!): Post!,
}

`;