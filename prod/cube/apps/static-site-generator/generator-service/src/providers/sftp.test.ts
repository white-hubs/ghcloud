import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockExists = vi.fn().mockResolvedValue(false);
const mockMkdir = vi.fn().mockResolvedValue(undefined);
const mockUploadDir = vi.fn().mockResolvedValue(undefined);
const mockEnd = vi.fn();

vi.mock('ssh2-sftp-client', () => ({
  default: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    exists: mockExists,
    mkdir: mockMkdir,
    uploadDir: mockUploadDir,
    end: mockEnd,
  })),
}));

import { SFTPProvider } from './sftp';

describe('SFTPProvider', () => {
  let provider: SFTPProvider;
  const onProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new SFTPProvider();
  });

  afterEach(() => {
    mockEnd.mockClear();
  });

  describe('constructor', () => {
    it('should have name as sftp', () => {
      expect(provider.name).toBe('sftp');
    });
  });

  describe('deploy', () => {
    it('should return error when missing host or username', async () => {
      const result = await provider.deploy({ username: 'user' }, '/tmp/path', onProgress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required config: host, username');
    });

    it('should return error when both password and privateKey are missing', async () => {
      const result = await provider.deploy({ host: 'sftp.example.com', username: 'user' }, '/tmp/path', onProgress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required config: password or privateKey');
    });

    it('should deploy successfully with password auth', async () => {
      const config = {
        host: 'sftp.example.com',
        port: 22,
        username: 'user',
        password: 'pass',
        remotePath: '/var/www',
      };

      const result = await provider.deploy(config, '/tmp/site', onProgress);

      expect(result.success).toBe(true);
      expect(mockConnect).toHaveBeenCalledWith({
        host: 'sftp.example.com',
        port: 22,
        username: 'user',
        password: 'pass',
        readyTimeout: 30000,
      });
      expect(mockMkdir).toHaveBeenCalled();
      expect(mockUploadDir).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('should deploy successfully with privateKey auth', async () => {
      const config = {
        host: 'sftp.example.com',
        username: 'user',
        privateKey: '-----BEGIN RSA PRIVATE KEY-----...',
        remotePath: '/var/www',
      };

      const result = await provider.deploy(config, '/tmp/site', onProgress);

      expect(result.success).toBe(true);
      expect(mockConnect).toHaveBeenCalledWith({
        host: 'sftp.example.com',
        port: 22,
        username: 'user',
        privateKey: '-----BEGIN RSA PRIVATE KEY-----...',
        readyTimeout: 30000,
      });
    });

    it('should not create directory if it already exists', async () => {
      mockExists.mockResolvedValueOnce(true);

      const config = {
        host: 'sftp.example.com',
        username: 'user',
        password: 'pass',
      };

      await provider.deploy(config, '/tmp/site', onProgress);

      expect(mockMkdir).not.toHaveBeenCalled();
    });

    it('should close connection after deploy', async () => {
      const config = {
        host: 'sftp.example.com',
        username: 'user',
        password: 'pass',
      };

      await provider.deploy(config, '/tmp/site', onProgress);

      expect(mockEnd).toHaveBeenCalled();
    });

    it('should return error when SFTP fails', async () => {
      mockConnect.mockRejectedValueOnce(new Error('Connection refused'));

      const config = {
        host: 'sftp.example.com',
        username: 'user',
        password: 'pass',
      };

      const result = await provider.deploy(config, '/tmp/site', onProgress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection refused');
      expect(mockEnd).toHaveBeenCalled();
    });
  });
});