import type { BTreeConfig } from "../types";

export const indexConfig: BTreeConfig = {
  keyColumns: ["pages", "title"],
  includeColumns: [],
  data: [
    { pages: 100, title: "The Great Gatsby" },
    { pages: 150, title: "Of Mice and Men" },
    { pages: 235, title: "Animal Farm" },
    { pages: 342, title: "To Kill a Mockingbird" },
    { pages: 478, title: "Pride and Prejudice" },
    { pages: 521, title: "Jane Eyre" },
    { pages: 689, title: "War and Peace" },
    { pages: 127, title: "The Old Man and the Sea" },
    { pages: 394, title: "Wuthering Heights" },
    { pages: 612, title: "Crime and Punishment" },
    { pages: 285, title: "The Catcher in the Rye" },
    { pages: 456, title: "Lord of the Flies" },
    { pages: 173, title: "The Pearl" },
    { pages: 598, title: "One Hundred Years of Solitude" },
    { pages: 334, title: "Brave New World" },
    { pages: 267, title: "Fahrenheit 451" },
    { pages: 150, title: "The Outsiders" },
    { pages: 235, title: "1984" },
    { pages: 342, title: "The Scarlet Letter" },
    { pages: 478, title: "Moby Dick" },
    { pages: 521, title: "Great Expectations" },
  ].map(item => ({ ...item, title: item.title.length > 10 ? item.title.slice(0, 15) + "..." : item.title })),
};
