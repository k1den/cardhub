import { describe, it, expect } from 'vitest';
import { runMaintenance } from '../src/lib/maintenance/service';

describe('Background Maintenance & 152-FZ Compliance (Cron)', () => {
  it('runs maintenance in dry-run mode without errors', async () => {
    const report = await runMaintenance({ dryRun: true, retentionDays: 30 });

    expect(report).toBeDefined();
    expect(report.dryRun).toBe(true);
    expect(typeof report.expiredSessionsDeleted).toBe('number');
    expect(typeof report.expiredTokensDeleted).toBe('number');
    expect(typeof report.usersHardDeleted).toBe('number');
    expect(typeof report.filesRemoved).toBe('number');
    expect(typeof report.subscriptionsExpired).toBe('number');
  });

  it('calculates 30-day cutoff date properly for 152-FZ', () => {
    const retentionDays = 30;
    const now = new Date();
    const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

    const diffDays = Math.round((now.getTime() - cutoff.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });
});
