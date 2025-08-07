import { useMemo } from "react";
import "./App.css";

// import { indexConfig } from "./data/idIncludeTitle";
// import { indexConfig } from "./data/idOrg";
// import { indexConfig } from "./data/idTitle";
// import { indexConfig } from "./data/idTitleBackup";
import { indexConfig } from "./data/idIncludeTitle";
import { createBTreeFromData } from "./util/bTreeHelpers";
import { BTree } from "./components/btree";

function App() {
  const tree = useMemo(() => createBTreeFromData(indexConfig), [indexConfig]);

  return (
    <div className="App">
      <header style={{ padding: "20px", textAlign: "center" }}>
        <h1>B+ Tree Visualizer</h1>
        <p>Interactive visualization of a B+ tree with (id, title) records</p>
      </header>
      <main>
        <div className="svg-container">
          <BTree tree={tree} config={indexConfig} />
        </div>
      </main>
    </div>
  );
}

export default App;
