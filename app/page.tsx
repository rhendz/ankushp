import Home3DSceneShell from "@/components/home/home-3d-scene-shell";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-stretch overflow-hidden">
      <div className="relative flex flex-1 flex-col items-stretch justify-center">
        <div className="relative min-h-[58vh] flex-1 sm:min-h-[62vh] lg:min-h-[68vh]">
          <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2">
            <Home3DSceneShell />
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 z-10 flex -translate-x-1/2 transform select-none flex-col flex-wrap text-center">
          <h1 className="flex-initial whitespace-nowrap text-4xl font-extrabold text-secondary sm:text-5xl lg:text-8xl">
            Ankush Patel
          </h1>
          <h2 className="flex-initial whitespace-nowrap font-mono text-2xl text-secondary sm:text-3xl lg:text-4xl">
            AI Engineer
          </h2>
        </div>
      </div>
    </div>
  );
}
