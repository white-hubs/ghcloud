import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAccess = vi.fn().mockResolvedValue(undefined);
const mockUploadDir = vi.fn().mockResolvedValue(undefined);
const mockClose = vi.fn();

vi.mock('basic-ftp', () => ({
  default: vi.fn().mockImplementation(() => ({
    access: mockAccess,
    uploadDir: mockUploadDir,
    close: mockClose,
  })),
}));

import { FTPProvider } from './ftp';

describe('FTPProvider', () => {
  let provider: FTPProvider;
  const onProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new FTPProvider();
  });

  afterEach(() => {
    mockClose.mockClear();
  });

  describe('constructor', () => {
    it('should have name as ftp', () => {
      expect(provider.name).toBe('ftp');
    });
  });

  describe('deploy', () => {
    it('should return error when missing required config', async () => {
      const result = await provider.deploy({}, '/tmp/path', onProgress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required config: host, username, password');
    });

    it('should return error when username is missing', async () => {
      const result = await provider.deploy({ host: 'ftp.example.com' }, '/tmp/path', onProgress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required config: host, username, password');
    });

    it('should deploy successfully with password auth', async () => {
      const config = {
        host: 'ftp.example.com',
        port: 21,
        username: 'user',
        password: 'pass',
        remotePath: '/public_html',
      };

      const result = await provider.deploy(config, '/tmp/site', onProgress);

      expect(result.success).toBe(true);
      expect(mockAccess).toHaveBeenCalledWith({
        host: 'ftp.example.com',
        port: 21,
        user: 'user',
        password: 'pass',
        secure: false,
      });
      expect(mockUploadDir).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('should close connection after deploy', async () => {
      const config = {
        host: 'ftp.example.com',
        username: 'user',
        password: 'pass',
      };

      await provider.deploy(config, '/tmp/site', onProgress);

      expect(mockClose).toHaveBeenCalled();
    });

    it('should return error when FTP fails', async () => {
      mockAccess.mockRejectedValueOnce(new Error('Connection refused'));

      const config = {
        host: 'ftp.example.com',
        username: 'user',
        password: 'pass',
      };

      const result = await provider.deploy(config, '/tmp/site', onProgress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection refused');
      expect(mockClose).toHaveBeenCalled();
    });
  });
});