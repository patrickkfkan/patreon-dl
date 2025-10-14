import fse from 'fs-extra';
import path from 'path';
import dateFormat from 'dateformat';
import { type LogLevel } from './logging/Logger.js';
import type Logger from './logging/Logger.js';
import { commonLog } from './logging/Logger.js';

export interface DiffOptions {
  logger?: Logger | null;
}

export interface FileDiff {
  timestamp: string;
  oldFile: string | null;
  newFile: string;
  changes: Change[];
  summary: string;
}

export interface Change {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldValue?: any;
  newValue?: any;
}

export interface MediaDiff {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  filename: string;
  oldSize?: number;
  newSize?: number;
  oldResolution?: string;
  newResolution?: string;
}

export default class DiffGenerator {
  name = 'DiffGenerator';
  #logger?: Logger | null;

  constructor(options?: DiffOptions) {
    this.#logger = options?.logger;
  }

  /**
   * Generate a diff between two JSON objects and save it to a file
   */
  async generateJSONDiff(
    oldFilePath: string | null,
    newFilePath: string,
    outputDiffPath: string
  ): Promise<FileDiff | null> {
    try {
      const timestamp = dateFormat('isoDateTime');

      // Read the files
      const newData = await fse.readJSON(newFilePath);
      const oldData = oldFilePath && fse.existsSync(oldFilePath)
        ? await fse.readJSON(oldFilePath)
        : null;

      if (!oldData) {
        this.log('debug', 'No previous version found, skipping diff generation');
        return null;
      }

      // Generate changes
      const changes = this.#compareObjects(oldData, newData, '');

      if (changes.length === 0) {
        this.log('debug', 'No changes detected between versions');
        return null;
      }

      const diff: FileDiff = {
        timestamp,
        oldFile: oldFilePath,
        newFile: newFilePath,
        changes,
        summary: this.#generateSummary(changes)
      };

      // Write diff to file
      const diffContent = this.#formatDiff(diff);
      await fse.ensureDir(path.dirname(outputDiffPath));
      await fse.writeFile(outputDiffPath, diffContent, 'utf-8');

      this.log('info', `Generated diff file: "${outputDiffPath}"`);
      return diff;
    }
    catch (error) {
      this.log('error', `Failed to generate diff: ${error}`);
      return null;
    }
  }

  /**
   * Update or create a changelog file for a post
   */
  async updateChangelog(
    changelogPath: string,
    diff: FileDiff,
    postId: string
  ): Promise<void> {
    try {
      let changelogContent = '';

      // Read existing changelog if it exists
      if (fse.existsSync(changelogPath)) {
        changelogContent = await fse.readFile(changelogPath, 'utf-8');
      }
      else {
        // Create new changelog with header
        changelogContent = `# Changelog for Post #${postId}\n\n`;
        changelogContent += `This file tracks all changes detected for this post.\n\n`;
        changelogContent += `---\n\n`;
      }

      // Add new entry at the top (after header)
      const headerEnd = changelogContent.indexOf('---\n\n') + 5;
      const newEntry = this.#formatChangelogEntry(diff);

      changelogContent =
        changelogContent.substring(0, headerEnd) +
        newEntry + '\n' +
        changelogContent.substring(headerEnd);

      await fse.writeFile(changelogPath, changelogContent, 'utf-8');
      this.log('info', `Updated changelog: "${changelogPath}"`);
    }
    catch (error) {
      this.log('error', `Failed to update changelog: ${error}`);
    }
  }

  /**
   * Generate a media comparison report
   */
  async generateMediaReport(
    outputPath: string,
    mediaDiffs: MediaDiff[]
  ): Promise<void> {
    try {
      if (mediaDiffs.length === 0) {
        return;
      }

      const timestamp = dateFormat('isoDateTime');
      let report = `# Media Changes Report\n\n`;
      report += `Generated: ${timestamp}\n\n`;
      report += `---\n\n`;

      const added = mediaDiffs.filter(d => d.type === 'added');
      const removed = mediaDiffs.filter(d => d.type === 'removed');
      const modified = mediaDiffs.filter(d => d.type === 'modified');

      if (added.length > 0) {
        report += `## Added (${added.length})\n\n`;
        for (const item of added) {
          report += `- **${item.filename}**\n`;
          if (item.newSize) {
            report += `  - Size: ${this.#formatBytes(item.newSize)}\n`;
          }
          if (item.newResolution) {
            report += `  - Resolution: ${item.newResolution}\n`;
          }
        }
        report += '\n';
      }

      if (removed.length > 0) {
        report += `## Removed (${removed.length})\n\n`;
        for (const item of removed) {
          report += `- **${item.filename}**\n`;
        }
        report += '\n';
      }

      if (modified.length > 0) {
        report += `## Modified (${modified.length})\n\n`;
        for (const item of modified) {
          report += `- **${item.filename}**\n`;
          if (item.oldSize && item.newSize) {
            const sizeDiff = item.newSize - item.oldSize;
            const sizeDiffStr = sizeDiff > 0 ? `+${this.#formatBytes(sizeDiff)}` : this.#formatBytes(sizeDiff);
            report += `  - Size: ${this.#formatBytes(item.oldSize)} → ${this.#formatBytes(item.newSize)} (${sizeDiffStr})\n`;
          }
          if (item.oldResolution && item.newResolution && item.oldResolution !== item.newResolution) {
            report += `  - Resolution: ${item.oldResolution} → ${item.newResolution}\n`;
          }
        }
        report += '\n';
      }

      await fse.ensureDir(path.dirname(outputPath));
      await fse.writeFile(outputPath, report, 'utf-8');
      this.log('info', `Generated media report: "${outputPath}"`);
    }
    catch (error) {
      this.log('error', `Failed to generate media report: ${error}`);
    }
  }

  #compareObjects(oldObj: any, newObj: any, basePath: string): Change[] {
    const changes: Change[] = [];

    // Get all unique keys from both objects
    const allKeys = new Set([
      ...Object.keys(oldObj || {}),
      ...Object.keys(newObj || {})
    ]);

    for (const key of allKeys) {
      const currentPath = basePath ? `${basePath}.${key}` : key;
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];

      // Skip if values are identical
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        continue;
      }

      // Key removed
      if (oldValue !== undefined && newValue === undefined) {
        changes.push({
          type: 'removed',
          path: currentPath,
          oldValue
        });
      }
      // Key added
      else if (oldValue === undefined && newValue !== undefined) {
        changes.push({
          type: 'added',
          path: currentPath,
          newValue
        });
      }
      // Both exist but different
      else if (typeof oldValue === 'object' && typeof newValue === 'object' &&
               !Array.isArray(oldValue) && !Array.isArray(newValue) &&
               oldValue !== null && newValue !== null) {
        // Recursively compare nested objects
        changes.push(...this.#compareObjects(oldValue, newValue, currentPath));
      }
      else {
        // Value modified
        changes.push({
          type: 'modified',
          path: currentPath,
          oldValue,
          newValue
        });
      }
    }

    return changes;
  }

  #generateSummary(changes: Change[]): string {
    const added = changes.filter(c => c.type === 'added').length;
    const removed = changes.filter(c => c.type === 'removed').length;
    const modified = changes.filter(c => c.type === 'modified').length;

    const parts: string[] = [];
    if (added > 0) parts.push(`${added} added`);
    if (removed > 0) parts.push(`${removed} removed`);
    if (modified > 0) parts.push(`${modified} modified`);

    return parts.join(', ');
  }

  #formatDiff(diff: FileDiff): string {
    let output = '# Post Info Diff\n\n';
    output += `**Timestamp:** ${diff.timestamp}\n`;
    output += `**Old Version:** ${diff.oldFile || 'N/A'}\n`;
    output += `**New Version:** ${diff.newFile}\n`;
    output += `**Summary:** ${diff.summary}\n\n`;
    output += '---\n\n';

    // Group changes by type
    const added = diff.changes.filter(c => c.type === 'added');
    const removed = diff.changes.filter(c => c.type === 'removed');
    const modified = diff.changes.filter(c => c.type === 'modified');

    if (added.length > 0) {
      output += `## Added Fields (${added.length})\n\n`;
      for (const change of added) {
        output += `### ${change.path}\n`;
        output += '```\n';
        output += this.#formatValue(change.newValue);
        output += '\n```\n\n';
      }
    }

    if (removed.length > 0) {
      output += `## Removed Fields (${removed.length})\n\n`;
      for (const change of removed) {
        output += `### ${change.path}\n`;
        output += '```\n';
        output += this.#formatValue(change.oldValue);
        output += '\n```\n\n';
      }
    }

    if (modified.length > 0) {
      output += `## Modified Fields (${modified.length})\n\n`;
      for (const change of modified) {
        output += `### ${change.path}\n\n`;
        output += '**Old Value:**\n```\n';
        output += this.#formatValue(change.oldValue);
        output += '\n```\n\n';
        output += '**New Value:**\n```\n';
        output += this.#formatValue(change.newValue);
        output += '\n```\n\n';
      }
    }

    return output;
  }

  #formatChangelogEntry(diff: FileDiff): string {
    let entry = `## ${diff.timestamp}\n\n`;
    entry += `**Summary:** ${diff.summary}\n\n`;

    if (diff.changes.length > 0) {
      entry += '**Changes:**\n';
      for (const change of diff.changes.slice(0, 10)) { // Show first 10 changes
        entry += `- [${change.type.toUpperCase()}] \`${change.path}\`\n`;
      }
      if (diff.changes.length > 10) {
        entry += `- ... and ${diff.changes.length - 10} more changes\n`;
      }
    }

    entry += '\n';
    return entry;
  }

  #formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    return JSON.stringify(value, null, 2);
  }

  #formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.#logger, level, this.name, ...msg);
  }
}
