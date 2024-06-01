import { useQuery } from "@apollo/client";
import { useParams } from "react-router";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import { Box, LinearProgress, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { artistStyles } from "../../styles/artist-styles";
import { TbWorldWww } from "react-icons/tb";
import { FaArtstation, FaFacebookF, FaInstagram, FaPatreon, FaTwitter, FaYoutube } from "react-icons/fa";
import { Timeline } from "react-twitter-widgets";

const Artist = () => {
    const name = useParams().name;
    document.title = `MtG Artist Connection - ` + name;
    const theme = useTheme();
    const isBelowMedium = useMediaQuery(theme.breakpoints.down("md"));
    const { data, error, loading } = useQuery(GET_ARTIST_BY_NAME, {
        variables: {
            name
        }
    });

    if (loading) return <LinearProgress />;
    if (error) return <p>Error loading artist</p>;

    const getTwitterHandle = (twitterUrl: any) => {
        if (!twitterUrl) return null;
        let match = twitterUrl.match(/^https?:\/\/(www\.)?twitter.com\/@?(?<handle>\w+)/);

        if (!match) {
            match = twitterUrl.match(/^https?:\/\/(www\.)?x.com\/@?(?<handle>\w+)/);
        }
        
        return match?.groups?.handle ? `@${match.groups.handle}` : null;
    }

    let twitterHandle;
    if (data.artistByName.twitter) {
        twitterHandle = getTwitterHandle(data.artistByName.twitter)?.replace('@', '');
    }

    return data && (
        <Box sx={artistStyles.container}>
            <Box sx={artistStyles.bannerContainer}>
                <img src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${data.artistByName.filename}.jpeg`} alt="" />
            </Box>
                <Typography variant="h2" fontWeight={600}>{data.artistByName.name}</Typography>
                <Box sx={artistStyles.infoRow}>
                    <Link  sx={artistStyles.link} href={`/allcards/${data.artistByName.name}`}>
                        <Typography color={"#159947"} variant="h5">{`View all ${data.artistByName.name} cards >`}</Typography>
                    </Link>
                </Box>
                {/* <Link sx={artistStyles.backLink} href="/">&#60; Back to All Artists</Link> */}
            <Box sx={artistStyles.artistPage}>
                <Box sx={{margin:"10px", display: "ruby"}}>
                    <Box sx={{...artistStyles.infoSection, flexDirection: isBelowMedium ? "column" : "row", alignItems: isBelowMedium ? "center" : "left"}}>
                        <Box sx={{...artistStyles.artistInfo, alignItems: isBelowMedium ? "center" : "left", minWidth: isBelowMedium ? "" : "400px"}}>
                            <Typography sx={artistStyles.sectionHeader} variant="h4">Artist Info</Typography>
                            <Box sx={artistStyles.infoRow}>
                                <Typography sx={{textAlign: isBelowMedium ? "center" : "left",}} variant="h5">Social Media Links:</Typography>
                                <Box sx={{...artistStyles.socialMedia, alignItems: isBelowMedium ? "left" : "center"}}>
                                    {data.artistByName.facebook !== "" && (
                                        <Link href={data.artistByName.facebook} target="_blank">
                                            <FaFacebookF size={30} color={"#4267B2"}/>
                                        </Link>)
                                    }
                                    {data.artistByName.instagram !== "" && (
                                        <Link href={data.artistByName.instagram} target="_blank">
                                            <FaInstagram size={30} color={"#C13584"}/>
                                        </Link>)
                                    }
                                    {data.artistByName.twitter !== "" && (
                                        <Link href={data.artistByName.twitter} target="_blank">
                                            <FaTwitter size={30} color={"#1DA1F2"}/>
                                        </Link>)
                                    }
                                    {data.artistByName.patreon !== "" && (
                                        <Link href={data.artistByName.patreon} target="_blank">
                                            <FaPatreon size={30} color={"#f96854"}/>
                                        </Link>)
                                    }
                                    {data.artistByName.youtube !== "" && (
                                        <Link href={data.artistByName.youtube} target="_blank">
                                            <FaYoutube size={30} color={"#FF0000"}/>
                                        </Link>)
                                    }
                                    {data.artistByName.artstation && data.artistByName.artstation !== "" && (
                                        <Link href={data.artistByName.artstation} target="_blank">
                                            <FaArtstation size={30} color={"#13AFF0"}/>
                                        </Link>)
                                    }
                                </Box>
                            </Box>
                            <Box sx={{...artistStyles.infoRow, alignItems: isBelowMedium ? "center" : "left"}}>
                                <Typography variant="h5">Artist Website:</Typography>
                                <Typography>
                                    {data.artistByName.url.length > 0 ?
                                    <Link href={data.artistByName.url} target="_blank"><TbWorldWww size={30} color={"black"} /></Link> : 
                                    "None"
                                    }
                                </Typography>
                            </Box>
                            <Box sx={{...artistStyles.infoRow, alignItems: isBelowMedium ? "center" : "left"}}>
                                <Typography variant="h5">Artist Email:</Typography>
                                <Typography>
                                    {
                                    data.artistByName.email ? 
                                    <Link sx={artistStyles.link} href={`mailto:${data.artistByName.email}`}>{data.artistByName.email}</Link> : 
                                    "Unknown"
                                    }
                                </Typography>
                            </Box>
                            <Box sx={{...artistStyles.infoRow, alignItems: isBelowMedium ? "center" : "left"}}>
                                <Typography variant="h5">Location:</Typography>
                                <Typography>{data.artistByName.location ? data.artistByName.location : "Unknown"}</Typography>
                            </Box>
                            <Box sx={{...artistStyles.infoRow, alignItems: isBelowMedium ? "center" : "left"}}>
                                <Typography variant="h5">Offer Signing?:</Typography>
                                <Typography>{data.artistByName.signing ? data.artistByName.signing.charAt(0).toUpperCase() + data.artistByName.signing.slice(1) : "Unknown"}</Typography>
                            </Box>
                            <Box sx={{...artistStyles.infoRow, textAlign: isBelowMedium ? "center" : "left", alignItems: isBelowMedium ? "center" : "left"}}>
                                <Typography variant="h5" sx={{alignText:"center"}}>Artist Proofs on website?:</Typography>
                                <Typography>{data.artistByName.artistProofs ? data.artistByName.artistProofs.charAt(0).toUpperCase() + data.artistByName.artistProofs.slice(1) : "Unknown"}</Typography>
                            </Box>
                            {data.artistByName.signingComment && (
                                <Box sx={{...artistStyles.infoRow, textAlign: isBelowMedium ? "center" : "left", alignItems: isBelowMedium ? "center" : "left"}}>
                                    <Typography variant="h6">{data.artistByName.signingComment}</Typography>
                                </Box>
                            )}
                            {data.artistByName.markssignatureservice && data.artistByName.markssignatureservice !== "false" && (
                                <Box sx={artistStyles.infoRow}>
                                    <Link sx={artistStyles.link} target="_blank" href="https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share" >Services offered via Marks Signature Service</Link>
                                </Box>
                            )}
                            {data.artistByName.mountainmage && data.artistByName.mountainmage !== "false" && (
                                <Box sx={artistStyles.infoRow}>
                                    <Link sx={artistStyles.link} target="_blank" href={data.artistByName.mountainmage} >Services offered via MountainMage Service</Link>
                                </Box>
                            )}
                        </Box>
                        <Box sx={{...artistStyles.signatureSection, paddingLeft: isBelowMedium ? "50px" : "", justifyContent: isBelowMedium ? "right" : "left", paddingTop: isBelowMedium ? "16px" : "0px"}}>
                            <Typography sx={{textAlign: isBelowMedium ? "center" : "left"}} variant="h4">Example Signature</Typography>
                            { data.artistByName.haveSignature === "true" &&
                                <img src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/signatures/${data.artistByName.filename}.jpg`} alt="" />
                            }
                            { data.artistByName.haveSignature === "false" &&
                                <img src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/emptycardframe.jpg`} alt="" />
                            }
                        </Box>
                        { twitterHandle &&
                        <Box sx={{paddingBottom: "25px", paddingLeft: isBelowMedium ? "50px" : "", justifyContent: isBelowMedium ? "right" : "left"}}>
                            <Timeline
                                dataSource={{ sourceType: "profile", screenName: twitterHandle }}
                                options={{ width: "400", height: "600" }}
                            />
                        </Box>
                        }
                    </Box>
                </Box>
            </Box>
        </Box>
    )
};

export default Artist;