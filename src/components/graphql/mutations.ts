import { gql } from "@apollo/client";
import { ADMIN_GROUP_ORDER_FIELDS, ARTIST_DASHBOARD_FIELDS, ORGANIZER_GROUP_ORDER_FIELDS, PARTICIPANT_GROUP_ORDER_FIELDS } from "./queries";

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
                id name city startDate endDate url
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

export const REMOVE_ARTISTFROMEVENT = gql`
    mutation removeArtistFromEvent(
        $artistName:String!,
        $eventId:String!,
        ){
            removeArtistFromEvent(
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
            token
            refreshToken
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
        $scryfall_name: String,
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
            scryfall_name: $scryfall_name,
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

export const SCAN_URL_FOR_ARTISTS = gql`
    mutation scanUrlForArtists($url: String!) {
        scanUrlForArtists(url: $url) {
            scannedTextLength
            scannedUrl
            matches {
                artistId
                name
                matchedAlias
                snippets
                imageMatches {
                    imageUrl
                    matchedText
                }
                occurrences
            }
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
                artist
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
    mutation logPriceClick($artistName: String!, $platform: String!, $cardName: String, $cardSet: String, $placement: String) {
        logPriceClick(artistName: $artistName, platform: $platform, cardName: $cardName, cardSet: $cardSet, placement: $placement) {
            success
        }
    }
`;

// Pre-`placement` signature, used only when the API hasn't been deployed with
// `placement` yet. Delete once the webservice is live everywhere.
export const LOG_PRICE_CLICK_LEGACY = gql`
    mutation logPriceClickLegacy($artistName: String!, $platform: String!, $cardName: String, $cardSet: String) {
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

export const LOG_PAGE_VIEW = gql`
    mutation logPageView($path: String!) {
        logPageView(path: $path) {
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
export const SUBMIT_SIGNING_REPORT = gql`
    mutation submitSigningReport($artistName: String!, $input: SigningReportInput!) {
        submitSigningReport(artistName: $artistName, input: $input) {
            id
            status
        }
    }
`;

export const REVIEW_SIGNING_REPORT = gql`
    mutation reviewSigningReport($id: ID!, $status: String!, $rejectionReason: String) {
        reviewSigningReport(id: $id, status: $status, rejectionReason: $rejectionReason) {
            success
            message
        }
    }
`;

export const DELETE_MY_SIGNING_REPORT = gql`
    mutation deleteMySigningReport($id: ID!) {
        deleteMySigningReport(id: $id) {
            success
            message
        }
    }
`;

export const DELETE_SIGNING_REPORT = gql`
    mutation deleteSigningReport($id: ID!) {
        deleteSigningReport(id: $id) {
            success
            message
        }
    }
`;

export const UPDATE_ARTIST_PROFILE = gql`
    mutation updateArtistProfile($artistId: ID!, $input: ArtistProfileInput!) {
        updateArtistProfile(artistId: $artistId, input: $input) {
            ${ARTIST_DASHBOARD_FIELDS}
        }
    }
`;

// ─── Group orders ───────────────────────────────────────────────────────────

export const CREATE_GROUP_ORDER = gql`
    mutation createGroupOrder($name: String!, $eventId: ID, $settings: GroupOrderSettingsInput!) {
        createGroupOrder(name: $name, eventId: $eventId, settings: $settings) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const UPDATE_GROUP_ORDER = gql`
    mutation updateGroupOrder($orderId: ID!, $name: String!, $eventId: ID, $settings: GroupOrderSettingsInput!) {
        updateGroupOrder(orderId: $orderId, name: $name, eventId: $eventId, settings: $settings) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const SET_GROUP_ORDER_STATUS = gql`
    mutation setGroupOrderStatus($orderId: ID!, $status: String!) {
        setGroupOrderStatus(orderId: $orderId, status: $status) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const RESET_GROUP_ORDER_INVITE = gql`
    mutation resetGroupOrderInvite($orderId: ID!, $revoke: Boolean) {
        resetGroupOrderInvite(orderId: $orderId, revoke: $revoke) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const REVIEW_GROUP_ORDER_REQUEST = gql`
    mutation reviewGroupOrderRequest($participantId: ID!, $approve: Boolean!) {
        reviewGroupOrderRequest(participantId: $participantId, approve: $approve) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const REMOVE_GROUP_ORDER_PARTICIPANT = gql`
    mutation removeGroupOrderParticipant($participantId: ID!) {
        removeGroupOrderParticipant(participantId: $participantId) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const ADD_GROUP_ORDER_GUEST = gql`
    mutation addGroupOrderGuest($orderId: ID!, $displayName: String!, $discordName: String) {
        addGroupOrderGuest(orderId: $orderId, displayName: $displayName, discordName: $discordName) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const JOIN_GROUP_ORDER = gql`
    mutation joinGroupOrder($token: String!, $discordName: String, $acceptTerms: Boolean!) {
        joinGroupOrder(token: $token, discordName: $discordName, acceptTerms: $acceptTerms) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const LEAVE_GROUP_ORDER = gql`
    mutation leaveGroupOrder($orderId: ID!) {
        leaveGroupOrder(orderId: $orderId) {
            success
            message
        }
    }
`;

export const UPDATE_DISCORD_NAME = gql`
    mutation updateDiscordName($discordName: String) {
        updateDiscordName(discordName: $discordName) {
            id
            discordName
        }
    }
`;

// Participants change their own cards; organizers can change anyone's.
export const ADD_GROUP_ORDER_ROW = gql`
    mutation addGroupOrderRow($orderId: ID!, $row: GroupOrderRowInput!) {
        addGroupOrderRow(orderId: $orderId, row: $row) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const UPDATE_GROUP_ORDER_ROW = gql`
    mutation updateGroupOrderRow($orderId: ID!, $rowId: String!, $row: GroupOrderRowInput!) {
        updateGroupOrderRow(orderId: $orderId, rowId: $rowId, row: $row) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const DELETE_GROUP_ORDER_ROW = gql`
    mutation deleteGroupOrderRow($orderId: ID!, $rowId: String!) {
        deleteGroupOrderRow(orderId: $orderId, rowId: $rowId) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const ORGANIZER_ADD_GROUP_ORDER_ROW = gql`
    mutation organizerAddGroupOrderRow($participantId: ID!, $row: GroupOrderRowInput!) {
        organizerAddGroupOrderRow(participantId: $participantId, row: $row) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const ORGANIZER_UPDATE_GROUP_ORDER_ROW = gql`
    mutation organizerUpdateGroupOrderRow($orderId: ID!, $rowId: String!, $row: GroupOrderRowInput!) {
        organizerUpdateGroupOrderRow(orderId: $orderId, rowId: $rowId, row: $row) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const ORGANIZER_DELETE_GROUP_ORDER_ROW = gql`
    mutation organizerDeleteGroupOrderRow($orderId: ID!, $rowId: String!) {
        organizerDeleteGroupOrderRow(orderId: $orderId, rowId: $rowId) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

// Group order progress: payments, shipping and check-in, custom items, event day.
export const REPORT_GROUP_ORDER_PAYMENT = gql`
    mutation reportGroupOrderPayment($orderId: ID!, $amount: Float!, $note: String) {
        reportGroupOrderPayment(orderId: $orderId, amount: $amount, note: $note) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const WITHDRAW_GROUP_ORDER_PAYMENT = gql`
    mutation withdrawGroupOrderPayment($orderId: ID!, $paymentId: String!) {
        withdrawGroupOrderPayment(orderId: $orderId, paymentId: $paymentId) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const MARK_GROUP_ORDER_READY_TO_SHIP = gql`
    mutation markGroupOrderReadyToShip($orderId: ID!) {
        markGroupOrderReadyToShip(orderId: $orderId) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const SET_GROUP_ORDER_INBOUND_TRACKING = gql`
    mutation setGroupOrderInboundTracking($orderId: ID!, $tracking: String) {
        setGroupOrderInboundTracking(orderId: $orderId, tracking: $tracking) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const SET_GROUP_ORDER_RETURN_OPTION = gql`
    mutation setGroupOrderReturnOption($orderId: ID!, $returnOptionId: String) {
        setGroupOrderReturnOption(orderId: $orderId, returnOptionId: $returnOptionId) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const UPDATE_GROUP_ORDER_NOTES = gql`
    mutation updateGroupOrderNotes($orderId: ID!, $notes: String) {
        updateGroupOrderNotes(orderId: $orderId, notes: $notes) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

export const SET_GROUP_ORDER_EMAIL_OPT_OUT = gql`
    mutation setGroupOrderEmailOptOut($orderId: ID!, $optOut: Boolean!) {
        setGroupOrderEmailOptOut(orderId: $orderId, optOut: $optOut) {
            success
            message
        }
    }
`;

export const RECORD_GROUP_ORDER_PAYMENT = gql`
    mutation recordGroupOrderPayment($participantId: ID!, $amount: Float!, $note: String) {
        recordGroupOrderPayment(participantId: $participantId, amount: $amount, note: $note) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const CONFIRM_GROUP_ORDER_PAYMENT = gql`
    mutation confirmGroupOrderPayment($participantId: ID!, $paymentId: String!) {
        confirmGroupOrderPayment(participantId: $participantId, paymentId: $paymentId) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const REMOVE_GROUP_ORDER_PAYMENT = gql`
    mutation removeGroupOrderPayment($participantId: ID!, $paymentId: String!) {
        removeGroupOrderPayment(participantId: $participantId, paymentId: $paymentId) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const CHECK_IN_GROUP_ORDER_PACKAGE = gql`
    mutation checkInGroupOrderPackage($participantId: ID!, $counts: [GroupOrderCheckInInput!]!) {
        checkInGroupOrderPackage(participantId: $participantId, counts: $counts) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const SET_GROUP_ORDER_RETURN_TRACKING = gql`
    mutation setGroupOrderReturnTracking($participantId: ID!, $tracking: String) {
        setGroupOrderReturnTracking(participantId: $participantId, tracking: $tracking) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const ADD_GROUP_ORDER_CUSTOM_ITEM = gql`
    mutation addGroupOrderCustomItem($participantId: ID!, $item: GroupOrderCustomItemInput!) {
        addGroupOrderCustomItem(participantId: $participantId, item: $item) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const UPDATE_GROUP_ORDER_CUSTOM_ITEM = gql`
    mutation updateGroupOrderCustomItem($participantId: ID!, $itemId: String!, $item: GroupOrderCustomItemInput!) {
        updateGroupOrderCustomItem(participantId: $participantId, itemId: $itemId, item: $item) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const REMOVE_GROUP_ORDER_CUSTOM_ITEM = gql`
    mutation removeGroupOrderCustomItem($participantId: ID!, $itemId: String!) {
        removeGroupOrderCustomItem(participantId: $participantId, itemId: $itemId) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const SET_GROUP_ORDER_ROW_STATUS = gql`
    mutation setGroupOrderRowStatus($orderId: ID!, $rowIds: [String!]!, $status: String!, $reason: String) {
        setGroupOrderRowStatus(orderId: $orderId, rowIds: $rowIds, status: $status, reason: $reason) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

// Group order trust and safety.
export const REPORT_GROUP_ORDER = gql`
    mutation reportGroupOrder($orderId: ID!, $reason: String!) {
        reportGroupOrder(orderId: $orderId, reason: $reason) {
            success
            message
        }
    }
`;

export const DELETE_GROUP_ORDER = gql`
    mutation deleteGroupOrder($orderId: ID!) {
        deleteGroupOrder(orderId: $orderId) {
            success
            message
        }
    }
`;

export const SET_GROUP_ORDER_DISABLED = gql`
    mutation setGroupOrderDisabled($orderId: ID!, $disabled: Boolean!, $reason: String) {
        setGroupOrderDisabled(orderId: $orderId, disabled: $disabled, reason: $reason) {
            ${ADMIN_GROUP_ORDER_FIELDS}
        }
    }
`;

export const RESOLVE_GROUP_ORDER_REPORTS = gql`
    mutation resolveGroupOrderReports($orderId: ID!) {
        resolveGroupOrderReports(orderId: $orderId) {
            ${ADMIN_GROUP_ORDER_FIELDS}
        }
    }
`;
