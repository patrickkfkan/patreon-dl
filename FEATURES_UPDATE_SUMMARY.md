# New Features Summary

This document summarizes the new features added to patreon-dl v3.3.2.

## Feature 1: Max Video Resolution for YouTube Downloads

### Problem Solved
Users want to control video file sizes and download speeds by limiting the maximum resolution of YouTube videos embedded in Patreon posts.

### Implementation
- **Config Option**: `max.video.resolution` under `[downloader]` section
- **File Modified**: `src/downloaders/task/YouTubeDownloadTask.ts`
- **How It Works**:
  1. Downloads best available video quality from YouTube
  2. Checks if resolution exceeds configured maximum (e.g., 1080, 1440, 2160)
  3. If exceeded, finds the best alternative format at or below max resolution
  4. Falls back to original if no suitable alternative exists
  5. Audio streams are never downgraded

### Usage Example
```conf
[downloader]
# Limit YouTube videos to 1440p (2560x1440)
max.video.resolution = 1440
```

### Testing
Tested with real Patreon post containing 2160p YouTube video:
- Original: 2160p (4K)
- With `max.video.resolution = 1440`: Downloaded as 1440p
- Result: 587MB file at 2560x1440 resolution

---

## Feature 2: Automatic Diff Tracking and Change History

### Problem Solved
When creators update posts, users want to:
1. Keep all previous versions (don't lose old content)
2. See exactly what changed between versions
3. Maintain a history of all updates
4. Track media file changes (additions, removals, size changes)

### Implementation
- **New File**: `src/utils/DiffGenerator.ts` - Standalone diff generation utility
- **File Modified**: `src/utils/FSHelper.ts` - Integrated into `writeTextFile()` method
- **Automatic Activation**: Works when using `saveAsCopyIfNewer` file exists action

### Features

#### 1. JSON Diff Generation
- **What**: Creates detailed diff files showing changes between versions
- **When**: Automatically when post/product info changes
- **Output**: Markdown-formatted diff file (`{filename}-diff-YYYYMMDD-HHMMSS.txt`)
- **Shows**:
  - Added fields (new data)
  - Removed fields (deleted data)
  - Modified fields (before → after)
  - Summary of changes

**Example Output**:
```markdown
# Post Info Diff

**Timestamp:** 2025-10-14T11:49:44-0400
**Old Version:** post-info.json
**New Version:** post-info (1).json
**Summary:** 1 added, 5 modified

---

## Added Fields (1)

### newField
\```
This field was added
\```

## Modified Fields (5)

### title

**Old Value:**
\```
Original Post Title
\```

**New Value:**
\```
Updated Post Title - Now with More Info!
\```
```

#### 2. Changelog Maintenance
- **What**: Maintains a running changelog in each post directory
- **File**: `CHANGELOG.md` in post/product root
- **Format**: Chronological list of all changes
- **Updates**: Automatically with each detected change

**Example Output**:
```markdown
# Changelog for Post #12345

This file tracks all changes detected for this post.

---

## 2025-10-14T11:49:44-0400

**Summary:** 1 added, 5 modified

**Changes:**
- [MODIFIED] `title`
- [MODIFIED] `content`
- [MODIFIED] `editedAt`
- [MODIFIED] `mediaItems`
- [MODIFIED] `commentCount`
- [ADDED] `newField`
```

#### 3. Media Change Reports
- **What**: Tracks changes to media files (images, videos, attachments)
- **File**: `media-changes.md` in post directory
- **Tracks**:
  - Added files
  - Removed files
  - Modified files (with size comparisons)
  - Future: Video resolution changes

**Example Output**:
```markdown
# Media Changes Report

Generated: 2025-10-14T11:49:44-0400

---

## Added (1)

- **image2.jpg**
  - Size: 2 MB

## Modified (1)

- **video1.mp4**
  - Size: 10 MB → 15 MB (+5 MB)
```

### Configuration

To enable diff tracking, use `saveAsCopyIfNewer` in your config:

```conf
[output]
# Save new versions of media files if content changes (don't overwrite)
content.file.exists.action = saveAsCopyIfNever

# Keep versioned copies of post info when it changes (DEFAULT)
info.file.exists.action = saveAsCopyIfNewer

# Also keep versioned API data instead of overwriting
info.api.file.exists.action = saveAsCopyIfNewer
```

### File Structure Example

When a post is updated, you'll see:
```
posts/140837854 - My Post Title/
├── CHANGELOG.md                          # Full history of changes
├── post_info/
│   ├── post-info.json                    # Original version
│   ├── post-info (1).json                # Updated version
│   ├── post-info-diff-20251014-114944.txt  # Diff between versions
│   ├── api-data.json                     # Original API data
│   └── api-data (1).json                 # Updated API data
├── images/
│   ├── image1.jpg                        # Original image
│   └── image1 (1).jpg                    # Updated image (if changed)
├── media-changes.md                      # Media change report
└── embed/
    └── youtube-video.mp4
```

### Benefits
- ✅ Never lose old content versions
- ✅ Track exactly what changed and when
- ✅ Monitor creator post updates
- ✅ Audit trail for compliance/archival
- ✅ Completely automatic - no extra steps needed

---

## Files Changed

### New Files
- `src/utils/DiffGenerator.ts` - Complete diff generation utility
- `test-diff.js` - Test script demonstrating diff functionality
- `FEATURES_SUMMARY.md` - This file

### Modified Files
- `src/downloaders/task/YouTubeDownloadTask.ts` - Added max resolution filtering
- `src/downloaders/DownloaderOptions.ts` - Added `maxVideoResolution` option
- `src/cli/CLIOptions.ts` - Added CLI support for max resolution
- `src/cli/ConfigFileParser.ts` - Added config parsing for max resolution
- `src/utils/FSHelper.ts` - Integrated diff generation
- `example.conf` - Documented max resolution option
- `CLAUDE.md` - Updated with new features

### Config Files
- `my-test.conf` - Test configuration with both features enabled

---

## Testing

### Max Video Resolution
```bash
# Build the project
npm run build:core

# Test with a config that limits resolution to 1080p
node bin/patreon-dl.js -C my-test.conf
```

Expected: YouTube videos download at configured max resolution

### Diff Tracking
```bash
# Run the test script
node test-diff.js
```

Expected: Generates sample diff files, changelog, and media report in `test-output/` directory

---

## Next Steps for Contributing

1. **Fork the repository** on GitHub
   - Go to https://github.com/patrickkfkan/patreon-dl
   - Click "Fork"

2. **Add your fork as remote**
   ```bash
   git remote add fork https://github.com/YOUR_USERNAME/patreon-dl
   ```

3. **Create feature branch**
   ```bash
   git checkout -b feature/max-resolution-and-diff-tracking
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "Add max video resolution and diff tracking features

   - Add max.video.resolution config option for YouTube downloads
   - Implement automatic diff generation for changed content
   - Add changelog maintenance per post
   - Add media change tracking and reports
   - Update documentation and examples"
   ```

5. **Push to your fork**
   ```bash
   git push fork feature/max-resolution-and-diff-tracking
   ```

6. **Create Pull Request** on GitHub
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in PR description with this summary

---

## Pull Request Description Template

```markdown
## Summary
Adds two new features to patreon-dl:
1. Max video resolution control for YouTube downloads
2. Automatic diff tracking and change history for updated content

## Max Video Resolution Feature
- Allows users to limit YouTube video downloads to a maximum resolution (e.g., 1080p, 1440p)
- Helps manage file sizes and download bandwidth
- Config option: `max.video.resolution` under `[downloader]` section
- Automatically finds best available quality at or below specified max
- Falls back gracefully if no suitable resolution available

## Diff Tracking Feature
- Automatically generates diffs when post info changes
- Maintains changelog for each post showing update history
- Tracks media file changes (additions, removals, size changes)
- Works automatically with `saveAsCopyIfNewer` file exists action
- Helps users track creator updates and never lose old content versions

## Testing
- Tested max resolution with real Patreon content (2160p → 1440p conversion)
- Created test script (`test-diff.js`) demonstrating diff functionality
- Both features work correctly in production environment

## Files Changed
- New: `src/utils/DiffGenerator.ts`
- Modified: `src/downloaders/task/YouTubeDownloadTask.ts`, `src/utils/FSHelper.ts`, and 6 others
- Updated documentation in `CLAUDE.md` and `example.conf`

## Breaking Changes
None - all features are opt-in via configuration.

## Documentation
- Updated `example.conf` with new options
- Updated `CLAUDE.md` with implementation details
- Created `FEATURES_SUMMARY.md` with comprehensive overview
```
