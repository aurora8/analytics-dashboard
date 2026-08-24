import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MetricsService } from '../src/metrics/metrics.service';
import { TitleBasics } from '../src/entities/title-basics.entity';

describe('MetricsService', () => {
  let service: MetricsService;
  let queryMock: jest.Mock;

  beforeEach(async () => {
    queryMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getRepositoryToken(TitleBasics),
          useValue: { manager: { query: queryMock } },
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getOverview returns the single summary row', async () => {
    queryMock.mockResolvedValue([{ total_titles: 100, total_movies: 40 }]);
    const result = await service.getOverview();
    expect(result).toEqual({ total_titles: 100, total_movies: 40 });
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('getOverview is cached: a second call does not query again', async () => {
    queryMock.mockResolvedValue([{ total_titles: 100 }]);
    await service.getOverview();
    await service.getOverview();
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('getGenreBreakdown returns the rows from the query', async () => {
    const rows = [{ genre: 'Drama', avg_rating: 7.1, title_count: 500 }];
    queryMock.mockResolvedValue(rows);
    const result = await service.getGenreBreakdown();
    expect(result).toEqual(rows);
  });

  it('getGenreTrends returns the rows from the query', async () => {
    const rows = [{ genre: 'Comedy', decade: 1990, title_count: 120 }];
    queryMock.mockResolvedValue(rows);
    const result = await service.getGenreTrends();
    expect(result).toEqual(rows);
  });

  it('getTopTitles with no filters uses only the base conditions and default limit', async () => {
    queryMock.mockResolvedValue([]);
    await service.getTopTitles({});
    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).not.toContain('startyear >=');
    expect(sql).not.toContain('startyear <=');
    expect(sql).not.toContain('genres ILIKE');
    expect(params).toEqual([20]);
  });

  it('getTopTitles applies yearFrom, yearTo, genre, and limit as positional params in order', async () => {
    queryMock.mockResolvedValue([]);
    await service.getTopTitles({ yearFrom: 1990, yearTo: 2000, genre: 'Drama', limit: 5 });
    const [sql, params] = queryMock.mock.calls[0];
    expect(sql).toContain('startyear >= $1');
    expect(sql).toContain('startyear <= $2');
    expect(sql).toContain('genres ILIKE $3');
    expect(params).toEqual([1990, 2000, '%Drama%', 5]);
  });

  it('getCastAnalysis returns the rows from the query', async () => {
    const rows = [{ primaryname: 'Someone', title_count: 6, avg_rating: 7.8 }];
    queryMock.mockResolvedValue(rows);
    const result = await service.getCastAnalysis();
    expect(result).toEqual(rows);
  });

  it('getCollaborations returns the rows from the query', async () => {
    const rows = [{ actor_name: 'A', director_name: 'B', collab_count: 5 }];
    queryMock.mockResolvedValue(rows);
    const result = await service.getCollaborations();
    expect(result).toEqual(rows);
  });
});
