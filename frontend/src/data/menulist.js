const menulist = [
  {
    title: "Home",
    link: `${import.meta.env.VITE_URL}/`,
    issubmenu: false,
  },
  {
    title: "Plants",
    link: `${import.meta.env.VITE_URL}/collections/plants`,
    issubmenu: false,
  },
  {
    title: "Seeds",
    link: `${import.meta.env.VITE_URL}/collections/seeds`,
    issubmenu: false,
  },
  {
    title: "Pots & Planters",
    link: `${import.meta.env.VITE_URL}/collections/planters`,
    issubmenu: false,
  },
  {
    title: "Plant Care",
    link: `${import.meta.env.VITE_URL}/collections/plant-care`,
    issubmenu: false,
  },
];

const sortbymenulist = [
  { id: "latest", title: "Latest" },
  { id: "lowprice", title: "Low to High" },
  { id: "highprice", title: "High to Low" },
];

const footermenulist = [
  {
    id: "fl1",
    title: "Company",
    submenu: [
      { id: "cid1", title: "About us", url: "#" },
      { id: "cid2", title: "Our Stores", url: "#" },
      { id: "cid4", title: "My Account", url: "#" },
    ],
  },
];

export {
  menulist,
  sortbymenulist,
  footermenulist,
};
