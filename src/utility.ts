import { QuestTree } from "./Quests/QuestManager";
// Imports
import cytoscape from "./Quests/cyto.js";

// utility UUID class
export class QuestUUID {
  static generateUUID(): string {
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return uuid.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export async function showGraph(tree: QuestTree): Promise<void> {
  //iterate over mygraph data to create the elements array to fee into the cytoscape graph
  const elements: any[] = [];
  const nodes = tree.nodes;
  const edges = tree.edges;

  const newTab = document.createElement("div");
  const target = document.getElementById("root");

  if (!target) {
    throw new Error("target not found");
  }
  newTab.setAttribute("id", "cy");
  newTab.setAttribute("style", "width: 500px; height: 500px; display: block; opacity: 1;z-index: 10;");
  newTab.setAttribute("width", "500px");
  newTab.setAttribute("height", "500px");
  target.appendChild(newTab);

  for (const node of nodes) {
    elements.push({
      data: {
        id: node.id,
        description: node.name,
        type: "quest",
      },
    });
  }

  for (const edge of edges) {
    elements.push({
      data: {
        id: edge.id,
        source: edge.parent.id,
        target: edge.child.id,
      },
    });
  }

  let cy = cytoscape({
    container: newTab, // container to render in
    elements: elements,
    style: [
      {
        selector: "node",
        style: {
          "background-color": "#000",
          label: "data(description)",
        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": "#ccc",
          "target-arrow-color": "#ccc",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
        },
      },
    ],
    layout: {
      name: "breadthfirst",
      fit: true,
      center: true,
      directed: true,
    },
  });

  //modify background color of node based on type
  cy.nodes().map((node: any) => {
    node.style("background-color", "blue");
  });

  setTimeout(async () => {
    cy.center();

    let myimagePromise = await cy.png({
      full: true,
      bg: "white",
      scale: 2,
      output: "blob-promise",
    });
  }, 1000);
}
