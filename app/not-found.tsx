import Link from "@/components/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start justify-start md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6">
      <div className="space-x-2 pb-8 pt-6 md:space-y-5">
        <h1 className="text-6xl font-extrabold leading-9 tracking-tight text-secondary border-accent/70 md:border-r-2 md:px-6 md:text-8xl md:leading-14">
          404
        </h1>
      </div>
      <div className="max-w-md">
        <p className="mb-4 text-xl font-bold leading-normal md:text-2xl">
          Sorry we couldn't find this page.
        </p>
        <p className="mb-8">
          But dont worry, you can go back to my homepage or you could find
          plenty of other things on my blog!
        </p>
        <div className="flex flex-row justify-between">
          <Link
            href={"/"}
            className="focus:shadow-outline-accent inline rounded-lg border border-transparent bg-accent px-4 py-2 text-sm font-medium leading-5 text-secondary shadow transition-colors duration-150 hover:bg-accent/70 focus:outline-none"
          >
            &larr; Homepage
          </Link>
          <Link
            href={"/blog"}
            className="focus:shadow-outline-accent inline rounded-lg border border-transparent bg-accent px-4 py-2 text-sm font-medium leading-5 text-secondary shadow transition-colors duration-150 hover:bg-accent/70 focus:outline-none"
          >
            Blog &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
