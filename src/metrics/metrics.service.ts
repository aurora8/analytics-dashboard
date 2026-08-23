import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TitleBasics } from '../entities/title-basics.entity';
import { TopTitlesQueryDto } from './dto/top-titles-query.dto';

@Injectable()
export class MetricsService {
  // Simple in-memory cache: the data is a one-time import that never
  // changes, so there's no staleness risk. Clears on server restart.
  private cache = new Map<string, unknown>();

  constructor(
    @InjectRepository(TitleBasics)
    private readonly titleBasicsRepo: Repository<TitleBasics>,
  ) {}

  private async cached<T>(key: string, compute: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    const result = await compute();
    this.cache.set(key, result);
    return result;
  }

  async getOverview() {
    return this.cached('overview', async () => {
      const [row] = await this.titleBasicsRepo.manager.query(`
        SELECT
          COUNT(*)::int AS total_titles,
          COUNT(*) FILTER (WHERE titletype = 'movie')::int AS total_movies,
          (SELECT COUNT(*) FROM name_basics)::int AS total_people,
          (SELECT ROUND(AVG(averagerating)::numeric, 2) FROM title_ratings) AS avg_rating,
          (SELECT SUM(numvotes)::bigint FROM title_ratings) AS total_votes,
          MIN(startyear) AS earliest_year,
          MAX(startyear) AS latest_year
        FROM title_basics
      `);
      return row;
    });
  }

  async getGenreBreakdown() {
    return this.cached('genres', () =>
      this.titleBasicsRepo.manager.query(`
        SELECT
          genre,
          ROUND(AVG(r.averagerating)::numeric, 2) AS avg_rating,
          SUM(r.numvotes)::bigint AS total_votes,
          COUNT(*)::int AS title_count
        FROM title_basics b
        JOIN title_ratings r ON b.tconst = r.tconst
        CROSS JOIN LATERAL unnest(string_to_array(b.genres, ',')) AS genre
        WHERE b.titletype = 'movie' AND b.genres IS NOT NULL AND r.numvotes >= 10000
        GROUP BY genre
        ORDER BY avg_rating DESC
      `),
    );
  }

  async getGenreTrends() {
    return this.cached('genre-trends', () =>
      this.titleBasicsRepo.manager.query(`
        SELECT
          genre,
          (startyear / 10) * 10 AS decade,
          COUNT(*)::int AS title_count
        FROM title_basics b
        CROSS JOIN LATERAL unnest(string_to_array(b.genres, ',')) AS genre
        WHERE b.titletype = 'movie' AND b.startyear IS NOT NULL AND b.genres IS NOT NULL
        GROUP BY genre, decade
        ORDER BY decade, genre
      `),
    );
  }

  async getTopTitles(query: TopTitlesQueryDto) {
    const conditions: string[] = [`b.titletype = 'movie'`, `r.numvotes >= 10000`];
    const params: any[] = [];

    if (query.yearFrom) {
      params.push(query.yearFrom);
      conditions.push(`b.startyear >= $${params.length}`);
    }
    if (query.yearTo) {
      params.push(query.yearTo);
      conditions.push(`b.startyear <= $${params.length}`);
    }
    if (query.genre) {
      params.push(`%${query.genre}%`);
      conditions.push(`b.genres ILIKE $${params.length}`);
    }

    const limit = query.limit ?? 20;
    params.push(limit);

    // Not cached: filters change per request, so results legitimately differ.
    return this.titleBasicsRepo.manager.query(
      `
      SELECT b.tconst, b.primarytitle, b.startyear, b.genres, b.runtimeminutes,
             r.averagerating, r.numvotes
      FROM title_basics b
      JOIN title_ratings r ON b.tconst = r.tconst
      WHERE ${conditions.join(' AND ')}
      ORDER BY r.averagerating DESC, r.numvotes DESC
      LIMIT $${params.length}
      `,
      params,
    );
  }

  async getCastAnalysis() {
    return this.cached('cast', () =>
      this.titleBasicsRepo.manager.query(`
        SELECT n.primaryname, COUNT(DISTINCT p.tconst)::int AS title_count,
               ROUND(AVG(r.averagerating)::numeric, 2) AS avg_rating
        FROM title_ratings r
        JOIN title_principals p ON r.tconst = p.tconst AND p.category IN ('actor', 'actress')
        JOIN name_basics n ON p.nconst = n.nconst
        WHERE r.numvotes >= 10000
        GROUP BY n.nconst, n.primaryname
        HAVING COUNT(DISTINCT p.tconst) >= 5
        ORDER BY avg_rating DESC, title_count DESC
        LIMIT 50
      `),
    );
  }

  async getCollaborations() {
    return this.cached('collaborations', () =>
      this.titleBasicsRepo.manager.query(`
        SELECT an.primaryname AS actor_name, dn.primaryname AS director_name,
               COUNT(*)::int AS collab_count
        FROM title_principals a
        JOIN title_principals d ON a.tconst = d.tconst AND d.category = 'director'
        JOIN title_ratings r ON a.tconst = r.tconst
        JOIN name_basics an ON a.nconst = an.nconst
        JOIN name_basics dn ON d.nconst = dn.nconst
        WHERE a.category IN ('actor', 'actress') AND r.numvotes >= 10000
        GROUP BY an.nconst, an.primaryname, dn.nconst, dn.primaryname
        HAVING COUNT(*) > 3
        ORDER BY collab_count DESC
        LIMIT 100
      `),
    );
  }
}
