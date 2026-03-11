"use client";

import dynamic from "next/dynamic";

import Home3DErrorBoundary from "@/components/home/home-3d-error-boundary";
import Home3DFallback from "@/components/home/home-3d-fallback";

const Home3DScene = dynamic(() => import("@/components/home/home-3d-scene"), {
  ssr: false,
  loading: () => null,
});

export default function Home3DSceneShell() {
  return (
    <Home3DErrorBoundary fallback={<Home3DFallback />}>
      <Home3DScene />
    </Home3DErrorBoundary>
  );
}
