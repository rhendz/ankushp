"use client";

import dynamic from "next/dynamic";

const Mermaid = dynamic(() => import("./mermaid"), {
  ssr: false,
});

export default Mermaid;
