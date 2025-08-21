import type { BTreeConfig } from "../types";

export const indexConfig: BTreeConfig = {
  keyColumns: ["publisher"],
  includeColumns: [],
  data: [
    { publisher: 4, title: "The Great Gatsby" },
    { publisher: 8, title: "Of Mice and Men" },
    { publisher: 8, title: "Animal Farm" },
    { publisher: 9, title: "To Kill a Mockingbird" },
    { publisher: 9, title: "Pride and Prejudice" },
    { publisher: 9, title: "Jane Eyre" },
    { publisher: 13, title: "War and Peace" },
    { publisher: 16, title: "The Old Man and the Sea" },
    { publisher: 16, title: "Wuthering Heights" },
    { publisher: 20, title: "Crime and Punishment" },
    { publisher: 21, title: "The Catcher in the Rye" },
    { publisher: 21, title: "Lord of the Flies" },
    { publisher: 21, title: "The Pearl" },
    { publisher: 25, title: "One Hundred Years of Solitude" },
    { publisher: 34, title: "Brave New World" },
    { publisher: 35, title: "Fahrenheit 451" },
    { publisher: 36, title: "The Outsiders" },
    { publisher: 37, title: "1984" },
    { publisher: 37, title: "The Scarlet Letter" },
    { publisher: 46, title: "Moby Dick" },
    { publisher: 46, title: "Great Expectations" },
  ].map(item => ({ ...item, title: item.title.length > 10 ? item.title.slice(0, 13) + "..." : item.title })),
};
