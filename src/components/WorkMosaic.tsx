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
  // Balance a short final row, without changing the reading order.
  const rowCount = Math.ceil(works.length / columns);
  let offset = 0;
  for (let row = 0; row < rowCount; row++) {
    const count = Math.ceil((works.length - offset) / (rowCount - row));
    rows.push(works.slice(offset, offset + count));
    offset += count;
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
