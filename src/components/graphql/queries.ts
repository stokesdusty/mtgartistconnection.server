import { gql } from "@apollo/client";

export const GET_ARTISTS_FOR_HOMEPAGE = gql`
    {
        artists{
            name
            alternate_names
            filename
            location
            signing
            markssignatureservice
            mountainmage
            artistProofs
        }
    }
`;

export const GET_ARTIST_BY_NAME = gql`
    query artistByName($name:String!){
        artistByName(name:$name){
            id
            name
            alternate_names
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

export const GET_CARD_PRICES = gql`
    query cardPricesByCards($cards: [CardLookupInput!]!) {
        cardPricesByCards(cards: $cards) {
            id
            name
            set_code
            number
            price_cents_nm
            price_cents_lp_plus
            price_cents
            price_cents_foil
            url
        }
    }
`;

export const GET_CARDKINGDOM_PRICES = gql`
    query cardKingdomPricesByNames($names: [String!]!) {
        cardKingdomPricesByNames(names: $names) {
            id
            name
            edition
            condition
            foil
            price
            url
            scryfallId
        }
    }
`;

export const GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS = gql`
    query cardKingdomPricesByScryfallIds($scryfallIds: [String!]!) {
        cardKingdomPricesByScryfallIds(scryfallIds: $scryfallIds) {
            id
            name
            edition
            condition
            foil
            price
            url
            scryfallId
        }
    }
`;

export const GET_CURRENT_USER = gql`
    query {
        me {
            id
            name
            email
            role
            emailPreferences {
                siteUpdates
                artistUpdates
                localSigningEvents
            }
            followedArtists
            monitoredStates
        }
    }
`;

export const GET_ARTIST_BY_ID = gql`
    query artistById($id: ID!) {
        artistById(id: $id) {
            id
            name
            email
            artistProofs
            facebook
            instagram
            twitter
            patreon
            youtube
            artstation
            bluesky
            signing
            signingComment
            haveSignature
            url
            location
            filename
            mountainmage
            markssignatureservice
            omalink
            inprnt
        }
    }
`;
