import { gql } from "@apollo/client";

export const USER_LOGIN = gql`
    mutation login($email:String!, $password:String!){
        login(email: $email, password: $password){
            id
            email
            name
        }
    }
`;

export const USER_SIGNUP = gql`
    mutation signup($name:String!, $email:String!, $password:String!){
        signup(name: $name, email: $email, password: $password){
            id
            email
            name
        }
    }
`;

export const ADD_ARTIST = gql`
    mutation addBlog(
        $name:String!,
        $email:String,
        $artistProofs:String,
        $facebook:String,
        $haveSignature:String,
        $instagram:String,
        $patreon:String, 
        $signing:String,
        $signingComment:String,
        $twitter:String,
        $url:String,
        $youtube:String,
        $mountainmage:String,
        $markssignatureservice:String,
        $filename:String,
        $artstation:String,
        $location:String,
        ){
            addArtist(
                name: $name,
                email: $email,
                artistProofs: $artistProofs,
                facebook: $facebook,
                haveSignature: $haveSignature,
                instagram: $instagram,
                patreon: $patreon,
                signing: $signing,
                signingComment: $signingComment,
                twitter: $twitter,
                url: $url,
                youtube: $youtube,
                mountainmage: $mountainmage,
                markssignatureservice: $markssignatureservice,
                filename: $filename,
                artstation: $artstation,
                location: $location,
            ){
                name
        }
    }
`;