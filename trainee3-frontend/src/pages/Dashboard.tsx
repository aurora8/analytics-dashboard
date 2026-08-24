import { useEffect, useState } from "react";
import FiltersBar from "../components/FiltersBar";
import GenreChart from "../components/GenreChart";
import TopTitlesTable from "../components/TopTitlesTable";
import CastChart from "../components/CastChart";
import CollaborationsChart from "../components/CollaborationsChart";
import RuntimeRatingScatter from "../components/RuntimeRatingScatter";
import {
  getOverview,
  getGenreBreakdown,
  getTopTitles,
  getCastAnalysis,
  getCollaborations,
  getScatterData,
  type Overview,
  type GenreBreakdown,
  type TopTitle,
  type CastMember,
  type Collaboration,
  type ScatterData,
  type TopTitlesFilters,
} from "../api/client";

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [genres, setGenres] = useState<GenreBreakdown[]>([]);
  const [topTitles, setTopTitles] = useState<TopTitle[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [scatter, setScatter] = useState<ScatterData | null>(null);
  const [titleFilters, setTitleFilters] = useState<TopTitlesFilters>({ limit: 20 });
  const [loading, setLoading] = useState(false);
  const [titlesLoading, setTitlesLoading] = useState(false);
  const [error, setError] = useState("");

  // Overview, genres, cast, collaborations, and scatter don't depend on the
  // title filters, so they only need to load once, not on every filter change.
  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([getOverview(), getGenreBreakdown(), getCastAnalysis(), getCollaborations(), getScatterData()])
      .then(([overviewData, genreData, castData, collabData, scatterData]) => {
        setOverview(overviewData);
        setGenres(genreData);
        setCast(castData);
        setCollaborations(collabData);
        setScatter(scatterData);
      })
      .catch((err) => {
        setError("Could not load metrics — is the backend running on localhost:3000?");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Only top-titles refetches when the filters change.
  useEffect(() => {
    setTitlesLoading(true);
    getTopTitles(titleFilters)
      .then(setTopTitles)
      .catch((err) => console.error(err))
      .finally(() => setTitlesLoading(false));
  }, [titleFilters]);

  return (
    <div style={{ padding: "24px" }}>
      <h1>IMDb analytics dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && overview && (
        <>
          <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
            <div>
              <strong>{overview.total_titles.toLocaleString()}</strong>
              <div>Total titles</div>
            </div>
            <div>
              <strong>{overview.total_movies.toLocaleString()}</strong>
              <div>Movies</div>
            </div>
            <div>
              <strong>{overview.total_people.toLocaleString()}</strong>
              <div>People</div>
            </div>
            <div>
              <strong>{overview.avg_rating}</strong>
              <div>Avg rating</div>
            </div>
          </div>
          <FiltersBar onApply={setTitleFilters} />
          <GenreChart data={genres} />
          <CastChart data={cast} />
          <CollaborationsChart data={collaborations} />
          {scatter && <RuntimeRatingScatter data={scatter} />}
          {titlesLoading && <p>Updating top titles...</p>}
          <TopTitlesTable data={topTitles} />
        </>
      )}
    </div>
  );
}
