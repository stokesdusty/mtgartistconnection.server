import { gql } from "@apollo/client";

export const USER_LOGIN = gql`
    mutation login($email:String!, $password:String!){
        login(email: $email, password: $password){
            token
            user {
                id
                email
                name
                role
            }
        }
    }
`;

export const USER_SIGNUP = gql`
    mutation signup($name:String!, $email:String!, $password:String!){
        signup(name: $name, email: $email, password: $password){
            token
            user {
                id
                email
                name
                role
            }
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
        $bluesky:String,
        $omalink:String,
        $inprnt:String
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
                bluesky: $bluesky,
                omalink: $omalink,
                inprnt: $inprnt
            ){
                name
        }
    }
`;

export const ADD_SIGNINGEVENT = gql`
    mutation addSigningEvent(
        $name:String!,
        $city:String!,
        $startDate:String!,
        $endDate:String!,
        $url:String,
        ){
            signingEvent(
                name: $name,
                city: $city,
                startDate: $startDate,
                endDate: $endDate,
                url: $url,
            ){
                name
        }
    }
`;

export const ADD_ARTISTTOEVENT = gql`
    mutation addArtistToEvent(
        $artistName:String!,
        $eventId:String!,
        ){
            mapArtistToEvent(
                artistName: $artistName,
                eventId: $eventId,
            ){
                artistName
        }
    }
`;

export const UPDATE_PASSWORD = gql`
    mutation updatePassword($currentPassword:String!, $newPassword:String!){
        updatePassword(currentPassword: $currentPassword, newPassword: $newPassword){
            success
            message
        }
    }
`;

export const UPDATE_EMAIL_PREFERENCES = gql`
    mutation updateEmailPreferences(
        $siteUpdates:Boolean!,
        $artistUpdates:Boolean!,
        $localSigningEvents:Boolean!
    ){
        updateEmailPreferences(
            siteUpdates: $siteUpdates,
            artistUpdates: $artistUpdates,
            localSigningEvents: $localSigningEvents
        ){
            success
            message
        }
    }
`;

export const FOLLOW_ARTIST = gql`
    mutation followArtist($artistName:String!){
        followArtist(artistName: $artistName){
            success
            message
        }
    }
`;

export const UNFOLLOW_ARTIST = gql`
    mutation unfollowArtist($artistName:String!){
        unfollowArtist(artistName: $artistName){
            success
            message
        }
    }
`;

export const MONITOR_STATE = gql`
  mutation MonitorState($state: String!) {
    monitorState(state: $state) {
      success
      message
    }
  }
`;

export const UNMONITOR_STATE = gql`
  mutation UnmonitorState($state: String!) {
    unmonitorState(state: $state) {
      success
      message
    }
  }
`;

export const UPDATE_ARTIST_BULK = gql`
    mutation updateArtistBulk(
        $id: ID!,
        $name: String,
        $email: String,
        $artistProofs: String,
        $facebook: String,
        $instagram: String,
        $twitter: String,
        $patreon: String,
        $youtube: String,
        $artstation: String,
        $bluesky: String,
        $signing: String,
        $signingComment: String,
        $haveSignature: String,
        $url: String,
        $location: String,
        $filename: String,
        $mountainmage: String,
        $markssignatureservice: String,
        $omalink: String,
        $inprnt: String,
    ) {
        updateArtistBulk(
            id: $id,
            name: $name,
            email: $email,
            artistProofs: $artistProofs,
            facebook: $facebook,
            instagram: $instagram,
            twitter: $twitter,
            patreon: $patreon,
            youtube: $youtube,
            artstation: $artstation,
            bluesky: $bluesky,
            signing: $signing,
            signingComment: $signingComment,
            haveSignature: $haveSignature,
            url: $url,
            location: $location,
            filename: $filename,
            mountainmage: $mountainmage,
            markssignatureservice: $markssignatureservice,
            omalink: $omalink,
            inprnt: $inprnt,
        ) {
            id
            name
        }
    }
`;