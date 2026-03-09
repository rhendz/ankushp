import Home3DSceneShell from "@/components/home/home-3d-scene-shell";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-stretch">
      <div className="relative flex flex-1 flex-col items-stretch justify-center">
        <div className="relative min-h-[55vh] flex-1">
          <Home3DSceneShell />
        </div>

        <div className="pointer-events-none absolute left-1/2 z-10 flex -translate-x-1/2 transform select-none flex-col flex-wrap text-center">
          <h1 className="flex-initial whitespace-nowrap text-4xl font-extrabold text-secondary lg:text-8xl">
            Ankush Patel
          </h1>
          <h2 className="flex-initial whitespace-nowrap font-mono text-2xl text-secondary lg:text-4xl">
            AI Engineer
          </h2>
        </div>
      </div>
    </div>
  );
}
