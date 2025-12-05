import {
  Box,
  Link,
  Typography,
  Container,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import { useEffect } from "react";
import { contentPageStyles } from "../../styles/content-page-styles";

interface Service {
  name: string;
  artistCount: string;
  costPerSignature: string;
  servicesOffered: string;
  description: string;
  website?: string;
  facebookGroup: string;
}

const services: Service[] = [
  {
    name: "Mark's Signature Service",
    artistCount: "100+",
    costPerSignature: "$3-$5 Regular, $7-$10 Shadow",
    servicesOffered: "Signing, Proofs, Playmats, Original Art",
    description:
      "Probably the most well known of the signing services, Mark's Artist Signature Signing Service operates out of a Facebook group. With 6.4k members, and plenty of happy customers posting in the group daily, he is a trusted resource. Often seen with artists at MtG related events, Mark offers signing for a big list of artists, as well as artist proofs, prints, playmats, and even original artwork.",
    facebookGroup:
      "https://www.facebook.com/groups/545759985597960/?multi_permalinks=1257167887790496&ref=share",
  },
  {
    name: "MountainMage MTG Signature Service",
    artistCount: "150+",
    costPerSignature: "$2-$8 Regular, Unknown Shadow",
    servicesOffered: "Signing, Proofs, Original Art",
    description:
      "If Facebook is not your forte, MountainMage is another signature service that has its own website. Offering a very extensive list of artists, MountainMage is another of the biggest services out there. You can select the artist you want, throw a signature in the shopping cart, and pay your way into the next signing.",
    website: "https://mountainmagesigs.com/",
    facebookGroup:
      "https://www.facebook.com/groups/313741109039074",
  },
];

const introParagraphs = [
  "For us, signed Magic: the Gathering cards put the Collectible in Collectible Card Game. But it should come as no surprise that we are biased. But hey, we like to think that most people's interest piques when they see a signed card enter the battlefield. That interest may soon turn to jealousy or even desire, but how do they go about getting their own cards signed?",
  "While many artists offer mail-in signings, or are on the MtG event circuit and sign in person, others are only taking in cards to sign from one or more of the services that manage and handle the logistics for them. There are a few such services, but the majority of artists use MountainMage or Mark's services.",
];

const howItWorksParagraphs = [
  "Generally speaking, the process for getting a card signed through a service is simple, albeit time consuming. Both of the above services post a schedule of upcoming signings, from which will be a deadline. This deadline is the date that the service needs to receive your cards to be included in the signing.",
  "Once you have picked out an artist and a date, you will need to decide if you want a regular signature, shadow signature, or perhaps some other custom job that is being offered, and then fill out a form with the pertinent information and submit that with your payment. Finally, you send your cards in and play the waiting game.",
  "Turnaround times for receiving your cards back can vary pretty greatly depending on the service and the artist, but in our personal experiences, these services are quite communicative and do a fairly good job of getting everyone's signatures in an expedient fashion.",
];

const SigningServices = () => {
  useEffect(() => {
    document.title = "MtG Artist Connection - Card Signing Services";
  }, []);

  const ServiceStatItem = ({ label, value }: { label: string; value: string }) => {
    return (
      <Box sx={contentPageStyles.statItem}>
        <Typography sx={contentPageStyles.statLabel}>{label}</Typography>
        <Typography sx={contentPageStyles.statValue}>{value}</Typography>
      </Box>
    );
  };

  const ServiceGroupContainer = ({ service }: { service: Service }) => {
    return (
      <Paper elevation={0} sx={contentPageStyles.serviceCard}>
        <Typography variant="h3" sx={contentPageStyles.serviceName}>
          {service.name}
        </Typography>

        <Box sx={contentPageStyles.serviceStats}>
          <ServiceStatItem label="# of Artists" value={service.artistCount} />
          <ServiceStatItem
            label="Cost Per Signature"
            value={service.costPerSignature}
          />
          <ServiceStatItem
            label="Services Offered"
            value={service.servicesOffered}
          />
        </Box>

        <Box sx={contentPageStyles.serviceInfo}>
          <Typography sx={contentPageStyles.paragraph}>
            {service.description}
          </Typography>
          <Box mt={2}>
            <Typography sx={{ ...contentPageStyles.paragraph, mb: 0 }}>
              You can view and join their Facebook group{" "}
              <Link
                sx={contentPageStyles.link}
                href={service.facebookGroup}
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </Link>
              {service.website && (
                <>
                  {" "}
                  or visit their{" "}
                  <Link
                    sx={contentPageStyles.link}
                    href={service.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    website
                  </Link>
                </>
              )}.
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={contentPageStyles.container}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={contentPageStyles.wrapper}>
          <Typography variant="h1" sx={contentPageStyles.pageTitle}>
            Card Signing Services
          </Typography>

          <Box mb={4}>
            {introParagraphs.map((paragraph, index) => (
              <Typography key={index} sx={contentPageStyles.paragraph}>
                {paragraph}
              </Typography>
            ))}
          </Box>

          <Divider sx={contentPageStyles.divider} />

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            How Do These Services Work?
          </Typography>

          <Box mb={4}>
            {howItWorksParagraphs.map((paragraph, index) => (
              <Typography key={index} sx={contentPageStyles.paragraph}>
                {paragraph}
              </Typography>
            ))}
          </Box>

          <Divider sx={contentPageStyles.divider} />

          <Typography variant="h2" sx={contentPageStyles.sectionTitle}>
            Available Services
          </Typography>

          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} key={service.name}>
                <ServiceGroupContainer service={service} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default SigningServices;