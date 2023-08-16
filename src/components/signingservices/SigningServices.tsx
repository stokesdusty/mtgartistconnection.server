import { Link, Typography } from "@mui/material";
import { Box } from "@mui/system"
import { signingServicesStyles } from "../../styles/signing-services-styles";

const SigningServices = () => {
    document.title = 'MtG Artist Connection - Card Signing Services';
    return <Box sx={signingServicesStyles.container}>
        <Typography variant="h2" fontFamily="Work Sans" fontWeight={600} >Card Signing Services</Typography>
        <Typography sx={signingServicesStyles.text}> 
            For us, signed Magic the Gathering cards put the Collectible in Collectible Card Game. but
            it should come as no surprise that we are biased. But hey, we like to think that most people's
            interest picques when they see a signed card enter the battlefield. That interest may soon turn 
            to jealousy or even desire, but how do they go about getting their own cards signed?
        </Typography>
        <Typography sx={signingServicesStyles.text}> 
            While many artists offer mail-in signings, or are on the MtG event circuit and sign in person, others
            are only taking in cards to sign from one or more of the services that manage and handle the logistics
            for them. There are a few such services, but the majority of artists use MountainMage or Mark's services.
        </Typography>
        <Typography variant="h3" fontFamily="Work Sans" fontWeight={600} >How Do These Services Work?</Typography>
        <Typography sx={signingServicesStyles.text}> 
            Generally speaking, the process for getting a card signed through a service is simple, albeit time consuming.
            Both of the above services post a schedule of upcoming signings, from which will be a deadline. This deadline is
            the date that the service needs to receive your cards to be included in the signing.
        </Typography>
        <Typography sx={signingServicesStyles.text}> 
            Once you have picked out an artist and a date, you will need to decide if you want a regular signature, shadow 
            signature, or perhaps some other custom job that is being offered, and then fill out a form with the pertinent
            information and submit that with your payment. Finally, you send your cards in and play the waiting game.
        </Typography>
        <Typography sx={signingServicesStyles.text}> 
             Turnaround times for receiving your cards back can vary pretty greatly depending on the service and the artist,
            but in our personal experiences, these services are quite communicative and do a fairly good job of getting 
            everyones signatures in an expediant fashion.
        </Typography>
        <Typography variant="h3">Mark's Signature Service</Typography>
        <Box sx={signingServicesStyles.serviceContainer}>
            <Box sx={signingServicesStyles.serviceStats}>
                <Typography variant="h5" fontWeight={600}># of Artists</Typography>
                <Typography>100+</Typography>
                <Typography variant="h5" fontWeight={600}>Cost Per Signaure</Typography>
                <Typography>$3-$5 Regular, $7-$10 Shadow</Typography>
                <Typography variant="h5" fontWeight={600}>Services Offered</Typography>
                <Typography>Signing, Proofs, Playmats, Original Art</Typography>
            </Box>
            <Box sx={signingServicesStyles.serviceInfo}>
                <Typography sx={signingServicesStyles.text}>
                Probably the most well known of the signing services, Mark's Artist Signature Signing Service operates
                    out of a Facebook group. With 6.4k members, and plenty of happy customers posting in the group daily,
                    he is a trusted resource. Often seen with artists at MtG related events, Mark offers signing for a big
                    list of artists, as well as artist proofs, prints, playmats, and even original artwork. 
                </Typography>
                <br />
                <Typography sx={signingServicesStyles.text}>
                You can view and join his Facebook group {/*  */}
                    <Link href="https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share"> here.</Link>
                </Typography>
            </Box>
        </Box>
        <Typography variant="h3">Mountain Mage MTG Signature Service</Typography>
        <Box sx={signingServicesStyles.serviceContainer}>
            <Box sx={signingServicesStyles.serviceStats}>
                <Typography variant="h5" fontWeight={600}># of Artists</Typography>
                <Typography>150+</Typography>
                <Typography variant="h5" fontWeight={600}>Cost Per Signaure</Typography>
                <Typography>$2-$8 Regular, Unknown Shadow</Typography>
                <Typography variant="h5" fontWeight={600}>Services Offered</Typography>
                <Typography>Signing</Typography>
            </Box>
            <Box sx={signingServicesStyles.serviceInfo}>
                <Typography sx={signingServicesStyles.text}>
                If Facebook is not your forte, Mountain Mage is another signature service that has its own 
                {/*  */}<Link href="https://mountainmagesigs.com/"> website. </Link>
                Offering a very extensive list of artists, Mountain Mage is another of the biggest services out there. You can
                select the artist you want, throw a signature in the shopping cart, and pay your way into the next signing. 
                </Typography>
                <br />
                <Typography sx={signingServicesStyles.text}>
                You can view and join his Facebook group {/*  */}
                    <Link href="https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share"> here.</Link>
                </Typography>
            </Box>
            
        </Box>
    </Box>;
};

export default SigningServices;