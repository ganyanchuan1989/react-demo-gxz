import React from "react";
import DndDemo from "./DndDemo";
import TreeDemo from './TreeDemo'

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <DndDemo />
        <TreeDemo/>
      </DndProvider>
    </div>
  );
}

export default App;
