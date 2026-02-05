import { gql } from "@apollo/client";

export const GET_ARTISTS_FOR_HOMEPAGE = gql`
    {
        artists{
            name
            filename
            location
            signing
            markssignatureservice
            mountainmage
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
            location
            bluesky
            omalink
            inprnt
        }
    }
`;

export const GET_SIGNINGEVENTS = gql`
    query {
        signingEvent {
            id
            name
            city
            startDate
            endDate
            url
        }
    }
`;

export const GET_ARTISTSBYEVENTID = gql`
    query mapArtistToEventByEventId($eventId:String!){
        mapArtistToEventByEventId(eventId:$eventId){
            artistName
        }
    }
`;

export const GET_EVENTS_BY_ARTIST = gql`
    query getEventsByArtist($artistName: String!) {
        signingEvent {
            id
            name
            city
            startDate
            endDate
            url
        }
    }
`;
