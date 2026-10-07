import { ReactNode } from "react";
import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { signingServicesStyles as styles } from "../../styles/signing-services-styles";
import MonoLabel from "../shared/MonoLabel";
import PageMeta from "../shared/PageMeta";

interface Service {
  name: string;
  artistCount: string;
  costPerSignature: string;
  servicesOffered: string;
  description: string;
  website?: string;
  facebookGroup: string;
  upcomingSignings?: string;
  /** Homepage filter param that lists this service's artists. */
  homepageFilter: "marksSig" | "mountainMage";
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
    upcomingSignings:
      "https://docs.google.com/spreadsheets/d/10_KH9fDQjElcnk4AmYnkY3siuKBLz4jbhb_wtvKiHAc/edit?gid=1645026839#gid=1645026839",
    homepageFilter: "marksSig",
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
    upcomingSignings:
      "https://docs.google.com/document/d/1Z695_k0Cvc458BsM540keBfV2B0Han-JKQIZC6DaCfY/edit?tab=t.0#heading=h.y24dm6r3wrdr",
    homepageFilter: "mountainMage",
  },
];

const introParagraphs = [
  "For us, signed Magic: the Gathering cards put the Collectible in Collectible Card Game. But it should come as no surprise that we are biased. But hey, we like to think that most people's interest piques when they see a signed card enter the battlefield. That interest may soon turn to jealousy or even desire, but how do they go about getting their own cards signed?",
  "While many artists offer mail-in signings, or are on the MtG event circuit and sign in person, others are only taking in cards to sign from one or more of the services that manage and handle the logistics for them. There are a few such services, but the majority of artists use MountainMage or Mark's services.",
];

const howItWorksSteps = [
  {
    title: "Pick an artist and a deadline",
    body: "Generally speaking, the process for getting a card signed through a service is simple, albeit time consuming. Both of the above services post a schedule of upcoming signings, from which will be a deadline. This deadline is the date that the service needs to receive your cards to be included in the signing.",
  },
  {
    title: "Choose your signature and pay",
    body: "Once you have picked out an artist and a date, you will need to decide if you want a regular signature, shadow signature, or perhaps some other custom job that is being offered, and then fill out a form with the pertinent information and submit that with your payment. Finally, you send your cards in and play the waiting game.",
  },
  {
    title: "Ship your cards and wait",
    body: "Turnaround times for receiving your cards back can vary pretty greatly depending on the service and the artist, but in our personal experiences, these services are quite communicative and do a fairly good job of getting everyone's signatures in an expedient fashion.",
  },
];

const ExternalButton = ({ href, children }: { href: string; children: ReactNode }) => (
  <Box
    component="a"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={[styles.button, styles.buttonSecondary]}
  >
    {children}
    <ArrowUpRight size={13} aria-hidden />
  </Box>
);

const ServicePanel = ({ service, index }: { service: Service; index: number }) => {
  const headingId = `service-${index}`;
  return (
    <Box component="article" aria-labelledby={headingId} sx={styles.panel}>
      <Box sx={styles.panelHead}>
        <MonoLabel size={11}>Service {String(index + 1).padStart(2, "0")}</MonoLabel>
        <MonoLabel size={11} tone="muted" tracking="tight">
          {service.website ? "Website + Facebook" : "Facebook group"}
        </MonoLabel>
      </Box>
      <Box component="h2" id={headingId} sx={styles.serviceName}>{service.name}</Box>

      <Box component="dl" sx={styles.stats}>
        <Box sx={styles.statRow}>
          <Box component="dt" sx={styles.statLabel}># of Artists</Box>
          <Box component="dd" sx={[styles.statValue, styles.statBig]}>{service.artistCount}</Box>
        </Box>
        <Box sx={styles.statRow}>
          <Box component="dt" sx={styles.statLabel}>Cost per signature</Box>
          <Box component="dd" sx={styles.statValue}>{service.costPerSignature}</Box>
        </Box>
        <Box sx={styles.statRow}>
          <Box component="dt" sx={styles.statLabel}>Services offered</Box>
          <Box component="dd" sx={styles.statValue}>
            {service.servicesOffered.split(", ").map((offer) => (
              <Box component="span" key={offer} sx={styles.tag}>{offer}</Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box component="p" sx={styles.description}>{service.description}</Box>

      <Box sx={styles.actions}>
        <Box
          component={RouterLink}
          to={`/?${service.homepageFilter}=true`}
          sx={[styles.button, styles.buttonPrimary]}
        >
          Browse their artists
          <ArrowRight size={14} weight="bold" aria-hidden />
        </Box>
        {service.upcomingSignings && (
          <ExternalButton href={service.upcomingSignings}>Upcoming signings</ExternalButton>
        )}
        <ExternalButton href={service.facebookGroup}>Facebook group</ExternalButton>
        {service.website && <ExternalButton href={service.website}>Website</ExternalButton>}
      </Box>
    </Box>
  );
};

const SigningServices = () => {
  usePageTitle("Card Signing Services");

  return (
    <Box sx={styles.page}>
      <PageMeta
        title="Card Signing Services"
        description="Learn how to get your Magic: The Gathering cards signed through professional signing services like Mark's and MountainMage."
        path="/signingservices"
      />

      <Box component="section" sx={styles.hero}>
        <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
          {services.length} signing services
        </MonoLabel>
        <Box component="h1" sx={styles.title}>Card signing services</Box>
        <Box component="p" sx={styles.lede}>{introParagraphs[1]}</Box>
      </Box>

      <Box sx={styles.services}>
        {services.map((service, index) => (
          <ServicePanel key={service.name} service={service} index={index} />
        ))}
      </Box>

      <Box component="section" aria-labelledby="how-it-works" sx={styles.howItWorks}>
        <Box>
          <MonoLabel size={11}>How it works</MonoLabel>
          <Box component="h2" id="how-it-works" sx={styles.sectionTitle}>
            How do signing services work?
          </Box>
          <Box component="p" sx={styles.paragraph}>{introParagraphs[0]}</Box>
        </Box>
        <Box component="ol" sx={styles.steps}>
          {howItWorksSteps.map((step, index) => (
            <Box component="li" key={step.title} sx={styles.step}>
              <Box sx={styles.stepNumber} aria-hidden>{String(index + 1).padStart(2, "0")}</Box>
              <Box>
                <Box component="h3" sx={styles.stepTitle}>{step.title}</Box>
                <Box component="p" sx={styles.stepBody}>{step.body}</Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SigningServices;
