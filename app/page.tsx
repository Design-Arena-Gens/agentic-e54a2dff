import ImageEditor from "@/components/ImageEditor";

const recommendedPlatforms = [
  {
    name: "Vercel Blob (private link)",
    description:
      "Fast CDN-backed storage with shareable signed URLs. Great when collaborating on Vercel projects."
  },
  {
    name: "Imgur (public link)",
    description:
      "Instant public hosting. Ideal for quick shareable demos when privacy is not a concern."
  },
  {
    name: "Dropbox / Google Drive",
    description:
      "Reliable when you need controlled access or multiple revisions of large assets."
  },
  {
    name: "GitHub issue attachment",
    description:
      "Drag images into an issue or discussion comment to store alongside project history."
  }
];

export default function HomePage() {
  return (
    <>
      <section className="panel hero-panel">
        <h1>Edit “image test” & share it fast</h1>
        <p>
          Need feedback or a revision on an image named <em>image test</em>? Use
          the editor below to tweak it right in your browser, then upload the
          exported result to any hosting option that fits how private or public
          you need the share link to be.
        </p>
        <ul>
          {recommendedPlatforms.map((platform) => (
            <li key={platform.name}>
              <div>
                <strong>{platform.name}</strong>
                <div>{platform.description}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="cta-note">
          <strong>Quick tip:</strong>
          <span>
            When someone asks “Where can I upload the image?”, send them this
            page. They can edit locally, export, and copy a shareable link in
            minutes.
          </span>
        </div>
      </section>

      <div className="page-grid">
        <ImageEditor />
        <section className="panel">
          <h2>How to share your edited image</h2>
          <p>
            Once you download the edited version, choose one of these workflows
            to share it.
          </p>
          <ul>
            <li>
              <div>
                <strong>Private handoff</strong> — Drop the file into your team
                chat or project management tool. Most tools (Slack, Linear,
                Notion) create a hosted copy automatically.
              </div>
            </li>
            <li>
              <div>
                <strong>Static file hosting</strong> — Upload to Vercel Blob,
                Cloudflare R2, or Supabase Storage and paste the signed link
                where reviewers can access it.
              </div>
            </li>
            <li>
              <div>
                <strong>Version control</strong> — Commit the image into your
                repository under a `/design` or `/assets` folder so the history
                is tracked in pull requests.
              </div>
            </li>
            <li>
              <div>
                <strong>Lightweight public link</strong> — Host on Imgur or
                Squoosh for easy viewing without login requirements.
              </div>
            </li>
          </ul>

          <p>
            The editor keeps everything local until you click download, so you
            control where the files land. Host the asset wherever is easiest
            and share the link with anyone who needs to review or continue the
            edits.
          </p>
        </section>
      </div>

      <footer className="app-footer">
        Built for quick image iteration. Drop in, adjust, export, share.
      </footer>
    </>
  );
}
