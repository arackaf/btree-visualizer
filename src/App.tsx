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

function App() {
  const tree = useMemo(() => createBTreeFromData(indexConfig), [indexConfig]);

  const [highlightedNodes, setHighlightedNodes] = useState<number[]>([]);
  const [showHeap] = useState<boolean>(true);

  const highlightedNodesProgression: number[][] = [
    [], // Start with no highlights
    [0], // Highlight root node
    [1], // Add node 1
    [4], // Add node 4
    [13], // Add node 13
  ];

  useEffect(() => {
    let currentIndex = 0;

    // Set initial state
    setHighlightedNodes(highlightedNodesProgression[0]);

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < highlightedNodesProgression.length) {
        setHighlightedNodes(highlightedNodesProgression[currentIndex]);
      } else {
        // Stop at the final state
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header style={{ padding: "20px", textAlign: "center" }}>
        <h1>B+ Tree Visualizer</h1>
        <p>Interactive visualization of a B+ tree with (id, title) records</p>
      </header>
      <main>
        <div className="svg-container">
          <BTree tree={tree} config={indexConfig} highlightedNodes={highlightedNodes} showHeap={showHeap} />
        </div>
      </main>
    </div>
  );
}

export default App;
