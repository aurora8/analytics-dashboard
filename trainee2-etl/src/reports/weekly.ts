import { createObjectCsvWriter } from 'csv-writer';
import { pool } from '../db/pool';

/**
 * Rewritten for IMDb: the old version summarized adoption/fraud/latency
 * from auth events. This summarizes top genres and top movies instead —
 * the closest equivalent for this dataset. Writes one CSV to reports/.
 *
 * Usage: npm run report:weekly
 */
async function main() {
  const genres = await pool.query(`
    SELECT genre, ROUND(AVG(r.averagerating)::numeric, 2) AS avg_rating, COUNT(*)::int AS title_count
    FROM title_basics b
    JOIN title_ratings r ON b.tconst = r.tconst
    CROSS JOIN LATERAL unnest(string_to_array(b.genres, ',')) AS genre
    WHERE b.titletype = 'movie' AND b.genres IS NOT NULL AND r.numvotes >= 10000
    GROUP BY genre
    ORDER BY avg_rating DESC
    LIMIT 5
  `);

  const topTitles = await pool.query(`
    SELECT b.primarytitle, b.startyear, r.averagerating, r.numvotes
    FROM title_basics b
    JOIN title_ratings r ON b.tconst = r.tconst
    WHERE b.titletype = 'movie' AND r.numvotes >= 10000
    ORDER BY r.averagerating DESC, r.numvotes DESC
    LIMIT 10
  `);

  const rows = [
    ...genres.rows.map((g) => ({
      section: 'Top genre',
      name: g.genre,
      detail: `avg rating ${g.avg_rating}, ${g.title_count} titles`,
    })),
    ...topTitles.rows.map((t) => ({
      section: 'Top movie',
      name: `${t.primarytitle} (${t.startyear})`,
      detail: `rating ${t.averagerating}, ${Number(t.numvotes).toLocaleString()} votes`,
    })),
  ];

  const filename = `reports/weekly-summary-${new Date().toISOString().slice(0, 10)}.csv`;
  const writer = createObjectCsvWriter({
    path: filename,
    header: [
      { id: 'section', title: 'Section' },
      { id: 'name', title: 'Name' },
      { id: 'detail', title: 'Detail' },
    ],
  });
  await writer.writeRecords(rows);
  console.log(`Wrote ${rows.length} rows to ${filename}`);
}

main().catch((err) => {
  console.error('Report failed:', err.message ?? err);
  process.exit(1);
});
