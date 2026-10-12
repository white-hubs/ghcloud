import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execFile } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { extractTarGz } from './extract';

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
}));

describe('extractTarGz', () => {
  const archivePath = '/tmp/test.tar.gz';
  const destDir = '/tmp/dest';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create destination directory recursively', async () => {
    vi.mocked(execFile).mockImplementation((_file, _args, callback) => {
      callback(null, '', '');
      return {} as any;
    });

    await extractTarGz(archivePath, destDir);

    expect(mkdir).toHaveBeenCalledWith(destDir, { recursive: true });
  });

  it('should call tar with correct arguments', async () => {
    vi.mocked(execFile).mockImplementation((_file, _args, callback) => {
      callback(null, '', '');
      return {} as any;
    });

    await extractTarGz(archivePath, destDir);

    expect(execFile).toHaveBeenCalledWith(
      'tar',
      ['-xzf', archivePath, '-C', destDir],
      expect.any(Function)
    );
  });

  it('should resolve when tar succeeds', async () => {
    vi.mocked(execFile).mockImplementation((_file, _args, callback) => {
      callback(null, 'stdout', '');
      return {} as any;
    });

    await expect(extractTarGz(archivePath, destDir)).resolves.toBeUndefined();
  });

  it('should reject when tar fails', async () => {
    const error = new Error('tar: cannot open');
    vi.mocked(execFile).mockImplementation((_file, _args, callback) => {
      callback(error, '', 'tar failed');
      return {} as any;
    });

    await expect(extractTarGz(archivePath, destDir)).rejects.toThrow(
      'tar extract failed: tar failed'
    );
  });
});