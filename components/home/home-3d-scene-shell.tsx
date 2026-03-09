"use client";

import dynamic from "next/dynamic";

import Home3DFallback from "@/components/home/home-3d-fallback";

const Home3DScene = dynamic(() => import("@/components/home/home-3d-scene"), {
  ssr: false,
  loading: () => <Home3DFallback />,
});

export default function Home3DSceneShell() {
  return <Home3DScene />;
}
