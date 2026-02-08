import type { AstroIntegration } from 'astro';
import { glob } from 'glob';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default function cleanupUnoptimizedImages(): AstroIntegration {
  return {
    name: 'cleanup-unoptimized-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distPath: string = fileURLToPath(dir);
        
        logger.info('🧹 Starting cleanup of unused assets...');

        const contentPattern: string = path.join(distPath, '**/*.{html,css,js,json}');
        const assetPattern: string = path.join(distPath, '_astro/*.{png,jpg,jpeg}');

        const contentFiles: string[] = await glob(contentPattern, { nodir: true });
        const assetFiles: string[] = await glob(assetPattern, { nodir: true });

        if (assetFiles.length === 0) {
           logger.info('No assets found to clean.');
           return;
        }

        const contentData: string[] = await Promise.all(
          contentFiles.map((f: string) => fs.readFile(f, 'utf-8'))
        );
        const allContent: string = contentData.join(' ');

        let deletedCount: number = 0;
        let savedBytes: number = 0;

        await Promise.all(
          assetFiles.map(async (assetPath: string) => {
            const filename: string = path.basename(assetPath);

            if (!allContent.includes(filename)) {
              try {
                const stats = await fs.stat(assetPath);
                await fs.unlink(assetPath);
                
                savedBytes += stats.size;
                deletedCount++;
              } catch (e) {
                const error = e as Error;
                logger.error(`Failed to delete ${filename}: ${error.message}`);
              }
            }
          })
        );

        const mbSaved: string = (savedBytes / 1024 / 1024).toFixed(2);
        
        if (deletedCount > 0) {
            logger.info(`✅ Cleanup complete: Removed ${deletedCount} files, saved ${mbSaved} MB.`);
        } else {
            logger.info(`✨ Clean build: No unused assets found.`);
        }
      },
    },
  };
}