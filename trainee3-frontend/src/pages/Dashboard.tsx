import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import FiltersBar from "../components/FiltersBar";
import GenreChart from "../components/GenreChart";
import GenreTrendsChart from "../components/GenreTrendsChart";
import TopTitlesTable from "../components/TopTitlesTable";
import CastChart from "../components/CastChart";
import CollaborationsChart from "../components/CollaborationsChart";
import RuntimeRatingScatter from "../components/RuntimeRatingScatter";
import AskAboutData from "../components/AskAboutData";
import {
  getOverview,
  getGenreBreakdown,
  getGenreTrends,
  getTopTitles,
  getCastAnalysis,
  getCollaborations,
  getScatterData,
  type Overview,
  type GenreBreakdown,
  type GenreTrend,
  type TopTitle,
  type CastMember,
  type Collaboration,
  type ScatterData,
  type TopTitlesFilters,
} from "../api/client";
import "./Dashboard.css";

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [genres, setGenres] = useState<GenreBreakdown[]>([]);
  const [genreTrends, setGenreTrends] = useState<GenreTrend[]>([]);
  const [topTitles, setTopTitles] = useState<TopTitle[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [scatter, setScatter] = useState<ScatterData | null>(null);
  const [titleFilters, setTitleFilters] = useState<TopTitlesFilters>({ limit: 20 });
  const [loading, setLoading] = useState(false);
  const [titlesLoading, setTitlesLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      getOverview(),
      getGenreBreakdown(),
      getGenreTrends(),
      getCastAnalysis(),
      getCollaborations(),
      getScatterData(),
    ])
      .then(([overviewData, genreData, trendData, castData, collabData, scatterData]) => {
        setOverview(overviewData);
        setGenres(genreData);
        setGenreTrends(trendData);
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

  useEffect(() => {
    setTitlesLoading(true);
    getTopTitles(titleFilters)
      .then(setTopTitles)
      .catch((err) => console.error(err))
      .finally(() => setTitlesLoading(false));
  }, [titleFilters]);

  return (
    <div>
      <NavBar />
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <FiltersBar onApply={setTitleFilters} />
        </aside>
        <main className="dashboard-main">
          {loading && <p style={{ color: "var(--text-secondary)" }}>Loading...</p>}
          {error && <p style={{ color: "var(--accent-red)" }}>{error}</p>}
          {!loading && !error && overview && (
            <>
              <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
                <div className="stat-card">
                  <strong>{overview.total_titles.toLocaleString()}</strong>
                  <div>Total titles</div>
                </div>
                <div className="stat-card">
                  <strong>{overview.total_movies.toLocaleString()}</strong>
                  <div>Movies</div>
                </div>
                <div className="stat-card">
                  <strong>{overview.total_people.toLocaleString()}</strong>
                  <div>People</div>
                </div>
                <div className="stat-card">
                  <strong>{overview.avg_rating}</strong>
                  <div>Avg rating</div>
                </div>
              </div>
              <AskAboutData />
              <GenreChart data={genres} />
              <GenreTrendsChart data={genreTrends} />
              <CastChart data={cast} />
              <CollaborationsChart data={collaborations} />
              {scatter && <RuntimeRatingScatter data={scatter} />}
              {titlesLoading && <p style={{ color: "var(--text-secondary)" }}>Updating top titles...</p>}
              <TopTitlesTable data={topTitles} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
