import Image from "next/image"
import Link from "next/link"

import emailIcon from "../public/images/email.svg"
import githubIcon from "../public/images/github.svg"
import linkedinIcon from "../public/images/linkedin.svg"
import twitterIcon from "../public/images/twitter.svg"

export default function Home() {
  return (
    <main className="container mx-auto max-w-2xl bg-transparent py-8">
      <div className="overflow-hidden rounded-xl shadow-lg">
        <div className="flex flex-col items-center pt-8">
          <h1 className="text-2xl font-extrabold">Ankush Patel</h1>
          <h2 className="text-l font-thin">ML Engineer | Bay Area</h2>
        </div>
        <div className="flex flex-col gap-y-2 px-4 py-8">
          <p>
            I graduated from the{" "}
            <span className="underline decoration-orange-500">
              University of Tennessee
            </span>{" "}
            with a master's in Computer Science focused in{" "}
            <span className="underline decoration-blue-500">
              Machine Learning
            </span>{" "}
            and{" "}
            <span className="underline decoration-blue-500">
              Neuromorphic Computing
            </span>
            .
          </p>
          <p>
            Currently, I'm focused on building{" "}
            <Link
              href="https://spice.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline decoration-red-500 hover:decoration-2"
            >
              spice
            </Link>{" "}
            - the community's distributed machine learning cluster.
          </p>
          <p>
            My interests include just about anything, but if I had to choose a
            few: I love{" "}
            <span className="underline decoration-green-500">fitness</span>,
            going on{" "}
            <span className="underline decoration-green-500">adventures</span>,
            and enjoying a nice cup of{" "}
            <span className="underline decoration-green-500">coffee</span>!
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl shadow-lg">
        <div className="flex flex-col items-center pt-16">
          <p className="text-l font-bold">Got an interesting idea?</p>
          <p className="text-m font-thin">Let's get in touch.</p>
          <div className="flex flex-row gap-x-12 py-8">
            <Link
              href="mailto:ap@ankushp.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="h-8 w-8"
                src={emailIcon}
                alt="Email me at ap@ankushp.com"
              ></Image>
            </Link>
            <Link
              href="https://github.com/rhendz"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="h-8 w-8"
                src={githubIcon}
                alt="Work with me on Github"
              ></Image>
            </Link>
            <Link
              href="https://www.linkedin.com/in/ankush-p/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="h-8 w-8"
                src={linkedinIcon}
                alt="Connect with me on LinkedIn"
              ></Image>
            </Link>
            <Link
              href="https://twitter.com/ankushp98"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="h-8 w-8"
                src={twitterIcon}
                alt="Follow me on Twitter"
              ></Image>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
