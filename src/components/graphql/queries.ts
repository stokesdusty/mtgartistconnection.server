import { gql } from "@apollo/client";

export const GET_ARTISTS_FOR_HOMEPAGE = gql`
    {
        artists{
            name
            filename
        }
    }
`;

export const GET_ARTIST_BY_NAME = gql`
    query artistByName($name:String!){
        artistByName(name:$name){
            name
            email
            artistProofs
            facebook
            haveSignature
            instagram
            signing
            patreon
            signingComment
            twitter
            url
            youtube
            mountainmage
            markssignatureservice
            filename
            artstation
        }
    }

`;