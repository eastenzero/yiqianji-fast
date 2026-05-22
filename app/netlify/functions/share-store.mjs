import { getStore } from '@netlify/blobs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const localStoreDir = fileURLToPath(new URL('../../.netlify/local-doctor-shares/', import.meta.url));

export function getShareStore() {
  if (shouldUseLocalStore()) return localStore;
  return getStore('doctor-shares');
}

function shouldUseLocalStore() {
  return (
    process.env.NODE_ENV !== 'production' &&
    !process.env.NETLIFY &&
    !process.env.NETLIFY_LOCAL &&
    !process.env.NETLIFY_BLOBS_CONTEXT
  );
}

const localStore = {
  async setJSON(key, value) {
    const filePath = getLocalFilePath(key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(value), 'utf8');
  },

  async get(key, options = {}) {
    try {
      const text = await readFile(getLocalFilePath(key), 'utf8');
      return options.type === 'json' ? JSON.parse(text) : text;
    } catch (error) {
      if (error && error.code === 'ENOENT') return null;
      throw error;
    }
  },

  async delete(key) {
    await rm(getLocalFilePath(key), { force: true });
  },
};

function getLocalFilePath(key) {
  if (!/^[a-z0-9]{8,24}$/i.test(key)) throw new Error('Invalid local share key');
  return join(localStoreDir, `${key}.json`);
}
