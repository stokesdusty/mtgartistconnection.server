import { useQuery } from "@apollo/client";
import { useParams } from "react-router";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import { Box, LinearProgress, Link, Typography } from "@mui/material";
import { artistStyles } from "../../styles/artist-styles";
import { TbWorldWww } from "react-icons/tb";
import { FaArtstation, FaFacebookF, FaInstagram, FaPatreon, FaTwitter, FaYoutube } from "react-icons/fa";

const Artist = () => {
    const name = useParams().name;
    const { data, error, loading } = useQuery(GET_ARTIST_BY_NAME, {
        variables: {
            name
        }
    });

    if (loading) return <LinearProgress />;
    if (error) return <p>Error loading artist</p>;
    return data && (
        <Box sx={artistStyles.container}>
            <Box sx={artistStyles.bannerContainer}>
                <img src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${data.artistByName.filename}.jpeg`} alt="" />
            </Box>
                <Typography variant="h2" fontWeight={600}>{data.artistByName.name}</Typography>
                {/* <Link sx={artistStyles.backLink} href="/">&#60; Back to All Artists</Link> */}
            <Box sx={artistStyles.infoSection}>
                <Box sx={artistStyles.artistInfo}>
                    <Typography sx={artistStyles.sectionHeader} variant="h4">Artist Info</Typography>
                    <Box sx={artistStyles.infoRow}>
                        <Typography variant="h5">Social Media Links:</Typography>
                        <Box sx={artistStyles.socialMedia}>
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
                    <Box sx={artistStyles.infoRow}>
                        <Typography variant="h5">Artist Website:</Typography>
                        <Typography>
                            {data.artistByName.url.length > 0 ?
                             <Link href={data.artistByName.url} target="_blank"><TbWorldWww size={30} color={"black"} /></Link> : 
                             "None"
                            }
                        </Typography>
                    </Box>
                    <Box sx={artistStyles.infoRow}>
                        <Typography variant="h5">Artist Email:</Typography>
                        <Typography>
                            {
                            data.artistByName.email ? 
                            <Link sx={artistStyles.link} href={`mailto:${data.artistByName.email}`}>{data.artistByName.email}</Link> : 
                            "Unknown"
                            }
                        </Typography>
                    </Box>
                    <Box sx={artistStyles.infoRow}>
                        <Typography variant="h5">Location:</Typography>
                        <Typography>{data.artistByName.location ? data.artistByName.location : "Unknown"}</Typography>
                    </Box>
                    <Box sx={artistStyles.infoRow}>
                        <Typography variant="h5">Offer Signing?:</Typography>
                        <Typography>{data.artistByName.signing ? data.artistByName.signing.charAt(0).toUpperCase() + data.artistByName.signing.slice(1) : "Unknown"}</Typography>
                    </Box>
                    <Box sx={artistStyles.infoRow}>
                        <Typography variant="h5">Artist Proofs on website?:</Typography>
                        <Typography>{data.artistByName.artistProofs ? data.artistByName.artistProofs.charAt(0).toUpperCase() + data.artistByName.artistProofs.slice(1) : "Unknown"}</Typography>
                    </Box>
                    <Box sx={artistStyles.infoRow}>
                        <Link  sx={artistStyles.link} href={`/allcards/${data.artistByName.name}`}>
                            <Typography color={"#159947"} variant="h5">{`View all ${data.artistByName.name} cards >`}</Typography>
                        </Link>
                    </Box>
                    {data.artistByName.signingComment && (
                        <Box sx={artistStyles.infoRow}>
                            <Typography variant="h6">{data.artistByName.signingComment}</Typography>
                        </Box>
                    )}
                    {data.artistByName.markssignatureservice && (
                        <Box sx={artistStyles.infoRow}>
                            <Link  sx={artistStyles.link} href="https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share" >Services offered via Marks Signature Service</Link>
                        </Box>
                    )}
                    {data.artistByName.mountainmage && (
                        <Box sx={artistStyles.infoRow}>
                            <Link  sx={artistStyles.link} href={data.artistByName.mountainmage} >Services offered via Mountain Mage Service</Link>
                        </Box>
                    )}
                </Box>
                <Box sx={artistStyles.signatureSection}>
                    <Typography variant="h4">Example Signature</Typography>
                    { data.artistByName.haveSignature === "true" &&
                        <img src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/signatures/${data.artistByName.filename}.jpg`} alt="" />
                    }
                    { data.artistByName.haveSignature === "false" &&
                        <img src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/emptycardframe.jpg`} alt="" />
                    }
                </Box>
            </Box>
        </Box>
    )
};

export default Artist;