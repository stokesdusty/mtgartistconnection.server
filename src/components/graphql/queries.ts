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

export const GET_ARTISTS_PAGE = gql`
    query artistsPage($offset: Int, $limit: Int) {
        artistsPage(offset: $offset, limit: $limit) {
            artists {
                name
                filename
            }
            total
        }
    }
`;

export const GET_ARTIST_FILTER_FLAGS = gql`
    {
        artistFilterFlags {
            name
            flags
            location
            alternate_names
        }
    }
`;

export const GET_ARTIST_BY_NAME = gql`
    query artistByName($name:String!){
        artistByName(name:$name){
            id
            name
            alternate_names
            scryfall_name
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

export const GET_ARTISTS_BY_EVENT_IDS = gql`
    query artistsByEventIds($eventIds: [String!]!) {
        artistsByEventIds(eventIds: $eventIds) {
            eventId
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
                newArtistNotifications
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
            scryfall_name
        }
    }
`;

export const GET_ARTIST_POSTS = gql`
    query artistPosts($isReviewed: Boolean, $limit: Int) {
        artistPosts(isReviewed: $isReviewed, limit: $limit) {
            id
            artistId
            artistName
            platform
            externalPostId
            content
            postUrl
            postDate
            fetchedAt
            isReviewed
        }
    }
`;

export const GET_NEWS_REVIEWS = gql`
    query newsReviews($isReviewed: Boolean, $isPublished: Boolean, $limit: Int) {
        newsReviews(isReviewed: $isReviewed, isPublished: $isPublished, limit: $limit) {
            id
            artistPostId
            artistId
            artistName
            artistIds
            artistNames
            title
            content
            summary
            sourcePostUrl
            imageUrl
            generatedAt
            isReviewed
            isPublished
            publishedAt
        }
    }
`;

export const GET_NEWS_REVIEW = gql`
    query newsReview($id: ID!) {
        newsReview(id: $id) {
            id
            artistPostId
            artistId
            artistName
            artistIds
            artistNames
            title
            content
            summary
            sourcePostUrl
            imageUrl
            generatedAt
            isReviewed
            isPublished
            publishedAt
        }
    }
`;

export const GET_USER_CARD_COLLECTION = gql`
    query userCardCollection($scryfallIds: [String!]!) {
        userCardCollection(scryfallIds: $scryfallIds) {
            id
            scryfallId
            cardName
            set
            collectorNumber
            signedNonfoil
            signedFoil
            wishlistSigned
            artistProof
            artistProofFoil
        }
    }
`;

export const GET_MY_CARD_COLLECTION = gql`
    query {
        myCardCollection {
            id
            scryfallId
            cardName
            artistName
            set
            collectorNumber
            signedNonfoil
            signedFoil
            wishlistSigned
            artistProof
            artistProofFoil
        }
    }
`;

export const GET_SIGNING_BATCHES = gql`
    query {
        signingBatches {
            id
            batchId
            name
            createdAt
            archived
            expanded
            sortOrder
            rows {
                rowId
                cardName
                quantity
                set
                foil
                owner
                signatureType
                sigNotes
                pricePerSig
                paymentStatus
                status
                signingMethod
                signingMethodLabel
                outboundTracking
                inboundTracking
            }
        }
    }
`;

export const GET_NEWS_REVIEWS_BY_ARTIST = gql`
    query newsReviewsByArtist($artistName: String!, $limit: Int) {
        newsReviewsByArtist(artistName: $artistName, limit: $limit) {
            id
            artistPostId
            artistId
            artistName
            artistIds
            artistNames
            title
            content
            summary
            sourcePostUrl
            imageUrl
            generatedAt
            isReviewed
            isPublished
            publishedAt
        }
    }
`;
