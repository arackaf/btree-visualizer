import { useMemo, useState, useEffect } from "react";
import "./App.css";

// import { indexConfig } from "./data/idIncludeTitle";
// import { indexConfig } from "./data/idOrg";
// import { indexConfig } from "./data/pages";
import { indexConfig } from "./data/publisher-title";
// import { indexConfig } from "./data/publisher";
// import { indexConfig } from "./data/title.ts";
// import { indexConfig } from "./data/pages-inc-title.ts";
// import { indexConfig } from "./data/idTitle";
// import { indexConfig } from "./data/idTitleBackup";
// import { indexConfig } from "./data/idIncludeTitle";
import { createBTreeFromData } from "./util/bTreeHelpers";
import { BTree } from "./components/btree";
import type { HighlightedItem } from "./types";

function App() {
  const tree = useMemo(() => createBTreeFromData(indexConfig), [indexConfig]);

  const [highlightedItems, setHighlightedItems] = useState<HighlightedItem[]>([]);
  const [showHeap, setShowHeap] = useState<boolean>(false);
  const [isHighlightingActive, setIsHighlightingActive] = useState<boolean>(false);

  const highlightedItemsProgression: HighlightedItem[][] = [
    [], // Start with no highlights
    [
      { type: "NODE", value: 0 },
      { type: "NODE", value: 1 },
      { type: "NODE", value: 2 },
      { type: "NODE", value: 4 },
      { type: "NODE", value: 7 },
    ], // Highlight root node
    // [{ type: "NODE", value: 2 }], // Add node 1
    // [{ type: "NODE", value: 9 }], // Add node 4
    // [
    //   { type: "NODE", value: 9 },
    //   { type: "HEAP_ARROW", value: 16 },
    // ], // Add node 4
    // [
    //   { type: "NODE", value: 9 },
    //   { type: "NODE", value: 10 },
    // ], // Add node 4
    // [
    //   { type: "NODE", value: 9 },
    //   { type: "NODE", value: 10 },
    //   { type: "NODE", value: 11 },
    // ], // Add node 4
    // [
    //   { type: "NODE", value: 9 },
    //   { type: "NODE", value: 10 },
    //   { type: "NODE", value: 11 },
    //   { type: "NODE", value: 12 },
    // ], // Add node 4
    //[{ type: "NODE", value: 13 }], // Add node 13
    // [{ type: "HEAP_ARROW", value: 0 }], // Highlight first heap arrow
    // [{ type: "HEAP_ARROW", value: 2 }], // Highlight third heap arrow
    // [
    //   { type: "HEAP_ARROW", value: 0 },
    //   { type: "HEAP_ARROW", value: 1 },
    //   { type: "HEAP_ARROW", value: 2 },
    //   { type: "HEAP_ARROW", value: 3 },
    //   { type: "HEAP_ARROW", value: 4 },
    //   { type: "HEAP_ARROW", value: 5 },
    //   { type: "HEAP_ARROW", value: 6 },
    //   { type: "HEAP_ARROW", value: 7 },
    //], // Multiple heap arrows
  ];

  useEffect(() => {
    if (!isHighlightingActive) {
      setHighlightedItems([]);
      return;
    }

    let currentIndex = 0;

    // Set initial state
    const initialItems = highlightedItemsProgression[0];
    setHighlightedItems(initialItems);
    if (initialItems.some(item => item.type === "HEAP_ARROW")) {
      setShowHeap(true);
    }

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < highlightedItemsProgression.length) {
        const currentItems = highlightedItemsProgression[currentIndex];
        setHighlightedItems(currentItems);
        if (currentItems.some(item => item.type === "HEAP_ARROW")) {
          setShowHeap(true);
        }
      } else {
        // Stop at the final state
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isHighlightingActive]);

  return (
    <div className="App">
      <button
        style={{ position: "fixed", top: "5px", left: "5px" }}
        onClick={() => setIsHighlightingActive(!isHighlightingActive)}
      >
        Toggle Highlighting
      </button>
      <header style={{ padding: "20px", textAlign: "center" }}>
        <h1>B+ Tree Visualizer</h1>
        <p>Interactive visualization of a B+ tree with (id, title) records</p>
      </header>
      <main>
        <div className="svg-container">
          <BTree tree={tree} config={indexConfig} highlightedItems={highlightedItems} showHeap={showHeap} />
        </div>
      </main>
    </div>
  );
}

export default App;
