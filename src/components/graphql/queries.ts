import { gql } from "@apollo/client";

export const GET_ARTIST_NAMES = gql`
    {
        artistNames {
            name
            filename
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
            filename
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
            artistNote
            artistNoteUpdatedAt
            isVerified
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

// Our artists credited in a set (null if the set isn't indexed yet).
export const GET_ARTISTS_BY_SET = gql`
    query artistsBySet($code: String!) {
        artistsBySet(code: $code)
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

// TCGplayer's naming for products (by TCGplayer product ID), for Mass Entry lines.
export const GET_TCGPLAYER_PRODUCTS = gql`
    query tcgplayerProducts($ids: [Int!]!) {
        tcgplayerProducts(ids: $ids) {
            productId
            name
            setCode
            number
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
            discordName
        }
    }
`;

// Kept apart from GET_CURRENT_USER so the header can ask for just these.
export const GET_MY_ARTIST_ACCESS = gql`
    query myArtistAccess {
        me {
            id
            isVerifiedArtist
            artistId
        }
    }
`;

export const ARTIST_DASHBOARD_FIELDS = `
    id
    name
    email
    url
    facebook
    instagram
    twitter
    patreon
    youtube
    artstation
    bluesky
    omalink
    inprnt
    location
    signing
    artistProofs
    artistNote
    artistNoteUpdatedAt
`;

export const GET_ARTIST_DASHBOARD = gql`
    query artistDashboard($artistId: ID) {
        artistDashboard(artistId: $artistId) {
            ${ARTIST_DASHBOARD_FIELDS}
        }
    }
`;

export const GET_ARTIST_EDIT_LOG = gql`
    query artistEditLog($artistId: ID!) {
        artistEditLog(artistId: $artistId) {
            id
            byAdmin
            createdAt
            changes {
                field
            }
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

export const GET_CLICK_STATS = gql`
    query clickStats($range: String, $groupBy: String!) {
        clickStats(range: $range, groupBy: $groupBy) {
            key
            count
        }
    }
`;

export const GET_TOP_ARTISTS_BY_CLICKS = gql`
    query topArtistsByClicks($range: String, $limit: Int) {
        topArtistsByClicks(range: $range, limit: $limit) {
            artistName
            artistId
            count
        }
    }
`;

export const GET_CLICK_TIMESERIES = gql`
    query clickTimeseries($range: String) {
        clickTimeseries(range: $range) {
            date
            count
        }
    }
`;

export const GET_PAGE_VIEW_COUNT = gql`
    query pageViewCount($range: String) {
        pageViewCount(range: $range)
    }
`;

export const GET_PAGE_VIEW_TIMESERIES = gql`
    query pageViewTimeseries($range: String) {
        pageViewTimeseries(range: $range) {
            date
            count
        }
    }
`;

export const GET_TOP_PAGES_BY_VIEWS = gql`
    query topPagesByViews($range: String, $limit: Int) {
        topPagesByViews(range: $range, limit: $limit) {
            key
            count
        }
    }
`;

const SIGNING_REPORT_FIELDS = `
    id
    artistName
    signedOn
    method
    pricePerSig
    freeCount
    perPersonLimit
    extras { kind price }
    turnaroundWeeks
    eventId
    serviceName
    note
`;

export const GET_SIGNING_REPORT_SUMMARY = gql`
    query signingReportSummary($artistName: String!) {
        signingReportSummary(artistName: $artistName) {
            count
            medianPrice
            minPrice
            maxPrice
            latestSignedOn
            byMethod { method count medianPrice }
        }
    }
`;

export const GET_RECENT_SIGNING_REPORTS = gql`
    query recentSigningReports($artistName: String!, $limit: Int) {
        recentSigningReports(artistName: $artistName, limit: $limit) {
            ${SIGNING_REPORT_FIELDS}
        }
    }
`;

export const GET_PENDING_SIGNING_REPORTS = gql`
    query pendingSigningReports($limit: Int) {
        pendingSigningReports(limit: $limit) {
            ${SIGNING_REPORT_FIELDS}
            createdAt
            submitterName
            submitterApprovedCount
            artistMedianPrice
        }
    }
`;

export const GET_MY_SIGNING_REPORTS = gql`
    query mySigningReports {
        mySigningReports {
            ${SIGNING_REPORT_FIELDS}
            status
            rejectionReason
            createdAt
        }
    }
`;

// ─── Group orders ───────────────────────────────────────────────────────────

const GROUP_ORDER_FIELDS = `
            id
            name
            status
            paymentTiming
            paymentDue
            disabled
            disabledReason
            eventId
            event { id name city startDate endDate }
            organizerDiscordName
            publicTerms
            cutoff
            maxCardsPerParticipant
            participantFee
            returnOptions { id label price }
            signatureTypes { id label }
            artists { name cap used remaining prices { signatureTypeId price } }
`;

// Group order cards. The price comes from the order's grid (artist + signature type).
const GROUP_ORDER_ROW_FIELDS = `rowId cardName quantity set foil artist signatureTypeId sigNotes owner participantId status notSignedReason receivedQuantity`;

const GROUP_ORDER_PARTICIPANT_FIELDS = `
            id
            isGuest
            displayName
            discordName
            status
            cardCount
            createdAt
            readyToShipAt
            sheetChanged
            inboundTracking
            receivedAt
            mismatchCount
            returnOptionId
            returnTracking
            notesToOrganizer
            emailOptOut
            payments { id amount note source createdAt confirmedAt }
            customItems { id label artistName quantity price status note }
            balance { cardsTotal customItemsTotal fee returnShipping pendingCount due confirmedPaid reportedPaid remaining status }
`;

// Shared with the organizer mutations so every change refreshes the cached order.
export const ORGANIZER_GROUP_ORDER_FIELDS = `
            ${GROUP_ORDER_FIELDS}
            savedStatus
            organizerEmailOptOut
            inviteToken
            privateInstructions
            rows { ${GROUP_ORDER_ROW_FIELDS} }
            participants { ${GROUP_ORDER_PARTICIPANT_FIELDS} }
`;

export const PARTICIPANT_GROUP_ORDER_FIELDS = `
            ${GROUP_ORDER_FIELDS}
            privateInstructions
            rows { ${GROUP_ORDER_ROW_FIELDS} }
            me { ${GROUP_ORDER_PARTICIPANT_FIELDS} }
`;

export const GET_GROUP_ORDER_INVITE = gql`
    query groupOrderByInvite($token: String!) {
        groupOrderByInvite(token: $token) {
            ${GROUP_ORDER_FIELDS}
            viewerStatus
        }
    }
`;

export const GET_ORGANIZED_GROUP_ORDER = gql`
    query organizedGroupOrder($orderId: ID!) {
        organizedGroupOrder(orderId: $orderId) {
            ${ORGANIZER_GROUP_ORDER_FIELDS}
        }
    }
`;

export const GET_MY_GROUP_ORDER = gql`
    query myGroupOrder($orderId: ID!) {
        myGroupOrder(orderId: $orderId) {
            ${PARTICIPANT_GROUP_ORDER_FIELDS}
        }
    }
`;

// The Signing Tracker's "Group orders" section: orders you run and orders you've joined.
export const GET_GROUP_ORDER_LISTS = gql`
    query groupOrderLists {
        organizedGroupOrders {
            id
            name
            status
            event { id name startDate endDate }
            participants { id status }
        }
        myGroupOrders {
            id
            name
            status
            organizerDiscordName
            event { id name startDate endDate }
            me { id status }
        }
    }
`;

export const GET_MY_DISCORD_NAME = gql`
    query myDiscordName {
        me {
            id
            discordName
        }
    }
`;

// Admin review of group orders: reports, and disabling.
export const ADMIN_GROUP_ORDER_FIELDS = `
            id name status createdAt organizerName organizerEmail organizerDiscordName inviteToken
            participantCount cardCount openReportCount disabled disabledReason
            reports { id reason reporterName reporterEmail createdAt resolvedAt }
`;

export const GET_ADMIN_GROUP_ORDERS = gql`
    query adminGroupOrders($reportedOnly: Boolean) {
        adminGroupOrders(reportedOnly: $reportedOnly) {
            ${ADMIN_GROUP_ORDER_FIELDS}
        }
    }
`;
