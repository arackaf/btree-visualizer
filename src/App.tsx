import { useMemo, useState, useEffect } from "react";
import "./App.css";

// import { indexConfig } from "./data/idIncludeTitle";
// import { indexConfig } from "./data/idOrg";
import { indexConfig } from "./data/idOnly";
// import { indexConfig } from "./data/idTitle";
// import { indexConfig } from "./data/idTitleBackup";
// import { indexConfig } from "./data/idIncludeTitle";
import { createBTreeFromData } from "./util/bTreeHelpers";
import { BTree } from "./components/btree";
import type { HighlightedItem } from "./types";

function App() {
  const tree = useMemo(() => createBTreeFromData(indexConfig), [indexConfig]);

  const [highlightedItems, setHighlightedItems] = useState<HighlightedItem[]>([]);
  const [showHeap] = useState<boolean>(false);
  const [isHighlightingActive, setIsHighlightingActive] = useState<boolean>(false);

  const highlightedItemsProgression: HighlightedItem[][] = [
    [], // Start with no highlights
    [{ type: "NODE", value: 0 }], // Highlight root node
    [{ type: "NODE", value: 1 }], // Add node 1
    [{ type: "NODE", value: 4 }], // Add node 4
    [{ type: "NODE", value: 13 }], // Add node 13
  ];

  useEffect(() => {
    if (!isHighlightingActive) {
      setHighlightedItems([]);
      return;
    }

    let currentIndex = 0;

    // Set initial state
    setHighlightedItems(highlightedItemsProgression[0]);

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < highlightedItemsProgression.length) {
        setHighlightedItems(highlightedItemsProgression[currentIndex]);
      } else {
        // Stop at the final state
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isHighlightingActive]);

  return (
    <div className="App">
      <button style={{ position: "fixed", top: "5px", left: "5px" }} onClick={() => setIsHighlightingActive(!isHighlightingActive)}>
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
