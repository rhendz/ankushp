import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Home3DSceneShell from "@/components/home/home-3d-scene-shell";
import Link from "@/components/link";
import { blogLandingConfig } from "@/data/blogLanding";
import { selectedWork } from "@/data/selectedWork";
import siteMetadata from "@/data/siteMetadata";

export default function Home() {
  return (
    <main id="main-content" className="home-v2">
      <section aria-labelledby="home-title" className="home-hero">
        <div className="home-intro">
          <p className="home-eyebrow">
            Ankush Patel <span aria-hidden="true">/</span> AI &amp; systems
            engineer
          </p>
          <h1 id="home-title">
            Useful AI.
            <br />
            Built to <span className="home-title-accent">hold up.</span>
          </h1>
          <p className="home-lede">
            I build reliable AI products and the backend systems behind them. My
            work spans inference, distributed infrastructure, and the workflows
            that turn models into useful software.
          </p>
          <div className="home-actions">
            <Link href="#work" className="home-button">
              Explore selected work <ArrowDown size={16} aria-hidden="true" />
            </Link>
            <a href={`mailto:${siteMetadata.email}`} className="home-text-link">
              Get in touch <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <p className="home-experience">
            Experience across Coinbase, Meta, and AI startups.
          </p>
        </div>
        <Home3DSceneShell />
      </section>

      <section id="work" aria-labelledby="work-title" className="home-section">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">01 / Selected work</p>
            <h2 id="work-title">Systems behind the experience.</h2>
          </div>
          <Link href="/about" className="home-text-link">
            Full background <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="home-work-grid">
          {selectedWork.map((work) => (
            <article key={work.number} className="home-work-item">
              <div className="home-work-meta">
                <p>{work.organization}</p>
                <span>{work.category}</span>
              </div>
              <h3>{work.title}</h3>
              <p className="home-work-description">{work.description}</p>
              <ul
                className="home-contributions"
                aria-label={`Contributions at ${work.organization}`}
              >
                {work.contributions.map((contribution) => (
                  <li key={contribution}>
                    <span aria-hidden="true">↗</span>
                    {contribution}
                  </li>
                ))}
              </ul>
              <p className="home-work-focus">{work.focus}</p>
            </article>
          ))}
        </div>
        <p className="home-public-proof">
          <span>Also built: Potify.</span> A pothole-reporting app connecting
          reports, work orders, and routes for road crews.{" "}
          <Link href="https://tickle.utk.edu/news/ut-students-develop-app-aimed-at-warning-city-about-potholes/">
            Featured by UT Engineering{" "}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </p>
      </section>

      <section
        id="writing"
        aria-labelledby="writing-title"
        className="home-section"
      >
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">02 / Selected writing</p>
            <h2 id="writing-title">How I think about building.</h2>
          </div>
          <Link href="/blog" className="home-text-link">
            All writing <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="home-writing-list">
          {blogLandingConfig.startHere.map((post, index) => (
            <article key={post.href}>
              <Link href={post.href} className="home-writing-link">
                <span className="home-writing-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                </div>
                <ArrowUpRight size={21} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="about-title"
        className="home-about home-section"
      >
        <div>
          <p className="home-eyebrow">03 / A little context</p>
          <h2 id="about-title">Curiosity, across layers.</h2>
        </div>
        <div className="home-about-copy">
          <p>
            My path runs from neuromorphic research at TENNLab to backend
            systems at Meta and Coinbase. I’m interested in what makes software
            useful, understandable, and dependable in practice.
          </p>
          <p>
            Outside of engineering: running, skiing, scuba diving, and finding
            somewhere new to eat.
          </p>
          <Link href="/about" className="home-text-link">
            More about me <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        id="contact"
        aria-labelledby="contact-title"
        className="home-contact home-section"
      >
        <p className="home-eyebrow">Let’s connect</p>
        <h2 id="contact-title">What are you building?</h2>
        <p>
          For a project, a role, or a good engineering conversation, send me a
          note.
        </p>
        <a href={`mailto:${siteMetadata.email}`} className="home-contact-email">
          {siteMetadata.email} <ArrowUpRight aria-hidden="true" />
        </a>
        <div className="home-contact-links">
          {siteMetadata.linkedin && (
            <Link href={siteMetadata.linkedin}>
              LinkedIn <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          )}
          <Link href={siteMetadata.github}>
            GitHub <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
