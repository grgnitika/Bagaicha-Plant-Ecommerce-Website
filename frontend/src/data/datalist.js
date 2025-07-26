import indoorplants from "@/assets/Icons/indoorplants.png";
import packing from "@/assets/Icons/packing.png";
import plantpot from "@/assets/Icons/plantpot.png";

const featurelists = [
  {
    id: 1,
    title: "Safe Packaging, Free Replacements",
    description: "Securely delivered, with complimentary replacements if needed.",
    imgsrc: packing,
  },
  {
    id: 2,
    title: "Curated Plant Collection",
    description: "Handpicked, diverse plants for every level of green thumb.",
    imgsrc: indoorplants,
  },
  {
    id: 3,
    title: "Healthy, Sustainable Plants",
    description: "Lush, eco-friendly indoor plants nurtured for vitality and well-being.",
    imgsrc: plantpot,
  },
];

const testimoniallist = [
  {
    id: "t1",
    name: "Sneha Joshi",
    avatarurl: "https://randomuser.me/api/portraits/women/11.jpg",
    message:
      "The plants were fresh and beautifully packaged!",
  },
  {
    id: "t2",
    name: "Rachin Ravindra",
    avatarurl: "https://randomuser.me/api/portraits/men/6.jpg",
    message:
      "Excellent customer service and healthy plants.",
  },
  {
    id: "t3",
    name: "Abhishek Kadu",
    avatarurl: "https://randomuser.me/api/portraits/men/39.jpg",
    message:
      "Highly recommended! Quick delivery and quality items.",
  },
];

export { featurelists, testimoniallist };
