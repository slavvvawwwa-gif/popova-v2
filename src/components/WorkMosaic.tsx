import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import type { WorkCard } from "@/lib/data";

function subscribeToColumns(notify: () => void) {
  const queries = [window.matchMedia("(min-width: 700px)"), window.matchMedia("(min-width: 1100px)")];
  queries.forEach(query => query.addEventListener("change", notify));
  return () => queries.forEach(query => query.removeEventListener("change", notify));
}
const getColumns = () => window.innerWidth >= 1100 ? 3 : window.innerWidth >= 700 ? 2 : 1;

export default function WorkMosaic({ works }: { works: WorkCard[] }) {
  const columns = useSyncExternalStore(subscribeToColumns, getColumns, () => 3);
  const rows: WorkCard[][] = [];
  // Alternating row sizes create large and small photos without cropping or reordering.
  let offset = 0;
  let rowIndex = 0;
  while (offset < works.length) {
    const preferred = columns === 3 ? (rowIndex % 2 === 0 ? 2 : 3)
      : columns === 2 ? (rowIndex % 2 === 0 ? 1 : 2) : 1;
    const remaining = works.length - offset;
    let count = Math.min(preferred, remaining);
    // Absorb a lone final photo on desktop rather than stretching it to full width.
    if (columns === 3 && remaining - count === 1) count++;
    rows.push(works.slice(offset, offset + count));
    offset += count;
    rowIndex++;
  }

  return (
    <div className="work-mosaic">
      {rows.map(row => (
        <div className="mosaic-row" key={row[0].slug}>
          {row.map(work => {
            const path = work.kind === "project" ? "/projects" : work.kind === "lab" ? "/lab" : "/works";
            return (
              <Link
                key={work.slug}
                to={`${path}/${work.slug}`}
                className="mosaic-card"
                style={{ flex: `${work.coverAspectRatio} 1 0%`, aspectRatio: work.coverAspectRatio }}
              >
                {work.coverUrl && <img src={work.coverUrl} alt={work.title} loading="lazy" decoding="async" />}
                <div className="mosaic-caption">
                  <p className="mosaic-location">{[work.theatre, work.year].filter(Boolean).join(" · ")}</p>
                  <h2>{work.title}</h2>
                  {work.shortDescription && <p className="mosaic-description">{work.shortDescription}</p>}
                </div>
                <span className="mosaic-arrow" aria-hidden="true">↗</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
