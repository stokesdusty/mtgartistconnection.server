import { gql } from "@apollo/client";

export const USER_LOGIN = gql`
    mutation login($email:String!, $password:String!){
        login(email: $email, password: $password){
            token
            refreshToken
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
            refreshToken
            user {
                id
                email
                name
                role
            }
        }
    }
`;

export const REFRESH_TOKEN = gql`
    mutation refreshToken($refreshToken:String!){
        refreshToken(refreshToken: $refreshToken){
            token
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
        $localSigningEvents:Boolean!,
        $newArtistNotifications:Boolean!
    ){
        updateEmailPreferences(
            siteUpdates: $siteUpdates,
            artistUpdates: $artistUpdates,
            localSigningEvents: $localSigningEvents,
            newArtistNotifications: $newArtistNotifications
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

export const UPDATE_ARTIST_POST = gql`
    mutation updateArtistPost($id: ID!, $isReviewed: Boolean!) {
        updateArtistPost(id: $id, isReviewed: $isReviewed) {
            success
            message
        }
    }
`;

export const DELETE_ARTIST_POST = gql`
    mutation deleteArtistPost($id: ID!) {
        deleteArtistPost(id: $id) {
            success
            message
        }
    }
`;

export const DELETE_REVIEWED_ARTIST_POSTS = gql`
    mutation deleteReviewedArtistPosts {
        deleteReviewedArtistPosts {
            success
            message
        }
    }
`;

export const GENERATE_NEWS_ARTICLE = gql`
    mutation generateNewsArticle($artistPostId: ID!) {
        generateNewsArticle(artistPostId: $artistPostId) {
            id
            artistPostId
            artistId
            artistName
            title
            content
            summary
            sourcePostUrl
            generatedAt
            isReviewed
            isPublished
            publishedAt
        }
    }
`;

export const UPDATE_NEWS_REVIEW = gql`
    mutation updateNewsReview(
        $id: ID!,
        $title: String,
        $content: String,
        $summary: String,
        $isReviewed: Boolean,
        $isPublished: Boolean
    ) {
        updateNewsReview(
            id: $id,
            title: $title,
            content: $content,
            summary: $summary,
            isReviewed: $isReviewed,
            isPublished: $isPublished
        ) {
            success
            message
        }
    }
`;

export const DELETE_NEWS_REVIEW = gql`
    mutation deleteNewsReview($id: ID!) {
        deleteNewsReview(id: $id) {
            success
            message
        }
    }
`;

export const GENERATE_MANUAL_NEWS_ARTICLE = gql`
    mutation generateManualNewsArticle($artistNames: [String], $content: String!, $sourceUrl: String, $imageUrl: String) {
        generateManualNewsArticle(artistNames: $artistNames, content: $content, sourceUrl: $sourceUrl, imageUrl: $imageUrl) {
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

export const TOGGLE_CARD_COLLECTION_FIELD = gql`
    mutation toggleCardCollectionField(
        $scryfallId: String!,
        $cardName: String!,
        $artistName: String,
        $set: String!,
        $collectorNumber: String!,
        $field: String!
    ) {
        toggleCardCollectionField(
            scryfallId: $scryfallId,
            cardName: $cardName,
            artistName: $artistName,
            set: $set,
            collectorNumber: $collectorNumber,
            field: $field
        ) {
            id
            scryfallId
            signedNonfoil
            signedFoil
            wishlistSigned
            artistProof
            artistProofFoil
        }
    }
`;

export const SAVE_SIGNING_BATCH = gql`
    mutation saveSigningBatch(
        $batchId: String!,
        $name: String!,
        $createdAt: String!,
        $archived: Boolean,
        $expanded: Boolean,
        $sortOrder: Int,
        $rows: [CardRowInput]
    ) {
        saveSigningBatch(
            batchId: $batchId,
            name: $name,
            createdAt: $createdAt,
            archived: $archived,
            expanded: $expanded,
            sortOrder: $sortOrder,
            rows: $rows
        ) {
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

export const DELETE_SIGNING_BATCH = gql`
    mutation deleteSigningBatch($batchId: String!) {
        deleteSigningBatch(batchId: $batchId) {
            success
            message
        }
    }
`;

export const REORDER_SIGNING_BATCHES = gql`
    mutation reorderSigningBatches($orderedBatchIds: [String!]!) {
        reorderSigningBatches(orderedBatchIds: $orderedBatchIds) {
            success
        }
    }
`;

export const LOG_PRICE_CLICK = gql`
    mutation logPriceClick($artistName: String!, $platform: String!, $cardName: String, $cardSet: String) {
        logPriceClick(artistName: $artistName, platform: $platform, cardName: $cardName, cardSet: $cardSet) {
            success
        }
    }
`;

export const LOG_LINK_CLICK = gql`
    mutation logLinkClick($artistName: String!, $linkType: String!) {
        logLinkClick(artistName: $artistName, linkType: $linkType) {
            success
        }
    }
`;

export const UPLOAD_NEWS_IMAGE = gql`
    mutation uploadNewsImage($base64Data: String!, $filename: String!, $contentType: String!) {
        uploadNewsImage(base64Data: $base64Data, filename: $filename, contentType: $contentType) {
            imageUrl
            key
        }
    }
`;