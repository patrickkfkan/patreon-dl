<a href='https://ko-fi.com/C0C5RGOOP' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi2.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

# patreon-dl

A Patreon downloader written in [Node.js](https://nodejs.org).

### Features
- Access to patron-only content through cookie. This refers to content you have access to under your account. It does not include locked content that you don't have a subscription for.
- Download posts by user, in a collection or single post
- Download products (aka shop purchases)
- Items included in downloads:
    - videos
    - images
    - audio
    - attachments
    - embedded videos
      - YouTube downloader built-in
      - Supports [external downloader](#embedded-videos---external-downloader)
- Save campaign and content info 
- Extensively configurable

You can run `patreon-dl` from the command-line or [use it as a library](./docs/Library.md) for your project. Node.js v18 or higher required.

### Limitations

- Embedded links are not followed; only info about the embed is saved.

### FFmpeg dependency

[FFmpeg](https://ffmpeg.org) is required when downloading:
- videos that are provided only in streaming format; and
- embedded YouTube videos.

Not all video downloads require FFmpeg, but you should have it installed on your system anyway.

### Embedded YouTube videos - Premium access

`patreon-dl` supports downloading embedded YouTube videos. In addition, if you have a YouTube Premium subscription, you can connect `patreon-dl` to your account and download videos at qualities available only to Premium accounts (e.g. '1080p Premium'). For CLI users, you would configure `patreon-dl` as follows:

```
$ patreon-dl --configure-youtube
```

> ...or you may just refer to the next section on how to download enhanecd-quality videos without a Premium account.

### Embedded videos - external downloader

You can specify external programs to download embedded videos. For YouTube videos, this will replace the built-in downloader. See the [example config](./example-embed.conf) on how to do this.

> The example config utilizes [yt-dlp](https://github.com/yt-dlp/yt-dlp), a popular program capable of downloading YouTube and Vimeo content. As of current release, `yt-dlp` is also able to download Premium-quality YouTube videos without a Premium account.

## Installation

1. First, install [Node.js](https://nodejs.org). 
2. Then, install [FFmpeg](https://ffmpeg.org) (if you are going to download videos).
3. Then, in a terminal, run the following command:

   ```
   $ npm i -g patreon-dl
   ```

   The `-g` option is for installing `patreon-dl` globally and have the CLI executable added to the PATH. Depending on your usage, you might not need this.

## CLI usage

```
$ patreon-dl [OPTION]... URL
```

### OPTION

| Option    | Alias | Description |
|-----------|-------|-------------|
| `--help`  | `-h`  | Display usage guide |
| <code><nobr>--config-file &lt;path&gt;</nobr></code> | `-C` | Load [configuration file](#configuration-file) at `<path>` for setting full options |
| `--cookie <string>` | `-c` | Cookie for accessing patron-only content; [how to obtain cookie](https://github.com/patrickkfkan/patreon-dl/wiki/How-to-obtain-Cookie). |
| `--ffmpeg <path>` | `-f` | Path to FFmpeg executable |
| `--out-dir <path>` |`-o` | Directory to save content |
| `--log-level <level>` | `-l` | Log level of the console logger: `info`, `debug`, `warn` or `error`; set to `none` to disable the logger. |
| `--no-prompt` | `-y` | Do not prompt for confirmation to proceed |
| `--dry-run`   |      | Run without writing files to disk (except logs, if any). Intended for testing / debugging. |
| <code><nobr>--list-tiers &lt;creator&gt;</nobr></code> | | <p>List tiers for the given creator(s). Separate multiple creators with a comma.</p>The purpose of this is to let you find out what tier IDs to set for `posts.in.tier` filtering option under `include` section of [configuration file](#configuration-file). |
| <code><nobr>--list-tiers-uid &lt;user ID&gt;</nobr></code> | | Same as `--list-tiers`, but takes user ID instead of vanity. |
| `--configure-youtube` | | <p>Configure YouTube connection.</p>`patreon-dl` supports downloading embedded YouTube videos. If you have a YouTube Premium account, you can connect `patreon-dl` to it for downloading Premium-quality streams. |

### URL

#### Supported URL formats

```
// Download a product
https://www.patreon.com/<creator>/shop/<slug>-<product_id>

// Download posts by creator
https://www.patreon.com/<creator>/posts
https://www.patreon.com/c/<creator>/posts
https://www.patreon.com/user/posts?u=<user_id>

// Dowload a single post
https://www.patreon.com/posts/<post_id>
https://www.patreon.com/posts/<slug>-<post_id>

// Download posts in a collection
https://www.patreon.com/collection/<collection_id>

```

#### Multiple URLs

You may specify multiple URLs by separating them with a comma. E.g.:

```
// First download posts by johndoe, followed by posts by janedoe.
$ patreon-dl "https://www.patreon.com/johndoe/posts,https://www.patreon.com/janedoe/posts"
```

#### Supplying URLs through file

You can also use a file to supply URLs to `patreon-dl`. For example, you can have a `urls.txt` that has the following content:

```
# Each URL is placed in its own line
# Comments (lines starting with '#') will be ignored

https://www.patreon.com/johndoe/posts
https://www.patreon.com/janedoe/posts

```

You can then pass `urls.txt` to `patreon-dl`:

```
$ patreon-dl urls.txt
```

In this file, you can also override `include` options provided in a [configuration file](#configuration-file) passed to `patreon-dl` (through the `-C` option). `include` options allow you specify what to include in downloads. This overriding mechanism allows you to specify different content to download for each target URL. For example, you might have the following `include` option in your configuration file:

```
...

[include]

# Include posts that belong only to tier ID '-1' (public tier)
posts.in.tier = -1

...
```

Then, in your `urls.txt`, you can override as follows:

```
# URL 1
https://www.patreon.com/johndoe/posts

# Override 'posts.in.tier = -1' in [include] section of configuration file.
# This will cause downloader to download posts from URL 1 belonging to tier with
# ID '123456' or '789100'.

include.posts.in.tier = 123456, 789100

# Other include options - they basically have the same name as those
# in the configuation file, but prepended with 'include.':
#
# include.locked.content
# include.posts.with.media.type
# include.posts.published.after
# include.posts.published.before
# include.campaign.info
# include.content.info
# include.preview.media
# include.content.media
# include.all.media.variants
# include.images.by.filename
# include.audio.by.filename
# include.attachments.by.filename

# URL 2 
https://www.patreon.com/janedoe/posts

# If you don't place any 'include.*' statements here, the downloader will use
# options from configuration file or default values if none provided.

# URL 3
...

```

### Directory structure

Content is saved with the following directory structure:
```
out-dir
    ├── campaign
        ├── campaign_info
        ├── posts
        │   ├── post 1
        │   │   ├── post_info
        │   │   ├── images
        │   │   ├── ...
        │   ├── post 2
        │       ├── post_info
        │       ├── images
        │       ├── ...
        ├──shop
            ├── product 1
                ├── product_info
                ├── content_media
                ├── ...
```


### Configuration file

Command-line options are limited. To access the full range of options, create a configuration file and pass it to `patreon-dl` with the (capital) `-C` option.

Refer to the [example config](./example.conf) to see what options are offered. Also see [How to obtain Cookie](https://github.com/patrickkfkan/patreon-dl/wiki/How-to-obtain-Cookie).

Note that you can override an option from a configuration file with one provided at the command-line, provided of course that a command-line equivalent is available.

## Changelog

v2.1.1
- Fix multiple abort signal listeners triggering warning ([#48](https://github.com/patrickkfkan/patreon-dl/issues/48))
- Fix YouTube embeds failing to download due to YT changes ([#50](https://github.com/patrickkfkan/patreon-dl/issues/50))
- Fix inline images of posts sometimes missing from downloads
- Fix status cache: target marked as downloaded without errors despite having errors at task creation stage

v2.1.0
- Fix attachment downloads following API changes ([#40](https://github.com/patrickkfkan/patreon-dl/issues/40))
- Add support for URL format: `https://www.patreon.com/c/<creator>/posts`
- Check and resolve conflicting destination paths ([#38](https://github.com/patrickkfkan/patreon-dl/issues/38))
- Parse inline content media ([#40](https://github.com/patrickkfkan/patreon-dl/issues/40))

v2.0.0
- Replace [node-fetch](https://github.com/node-fetch/node-fetch) with Fetch API; required Node.js version bumped to v18 or higher.
- Update dependencies and libraries
- New `include` options:
  - `include.postsPublished` ([#29](https://github.com/patrickkfkan/patreon-dl/issues/29))
  - `include.mediaByFilename` ([#33](https://github.com/patrickkfkan/patreon-dl/issues/33))
- Bug fixes:
  - 403 error when downloading YouTube embeds
  - Only first of multiple targets downloaded ([#26](https://github.com/patrickkfkan/patreon-dl/issues/26))

v1.7.0
- Download next batch of posts before expiry of 'next' URL (fixes [#22](https://github.com/patrickkfkan/patreon-dl/issues/22))
- Add `--dry-run` / `dryRun` option
- Support URL format `https://www.patreon.com/posts/<post_id>`

v1.6.2
- Fix 'campaign ID not found' error due to Patreon changes

v1.6.1
- Fix file extension sometimes missing ([#20](https://github.com/patrickkfkan/patreon-dl/issues/20))

v1.6.0
- Add external downloader support for embedded videos

v1.5.0
- Add support for fetching by user ID instead of creator vanity ([#18](https://github.com/patrickkfkan/patreon-dl/issues/18)):
  - Support URL format `https://www.patreon.com/user/posts?u=<user_id>`
  - Overload `PatreonDownloader.getCampaign()` to take `userId` arg
  - CLI: add `--list-tiers-uid`

v1.4.0
- Add ability to filter posts by tier ([#8](https://github.com/patrickkfkan/patreon-dl/issues/8))
- CLI:
  - Add `--list-tiers`
  - Add support for target-specific `include` options
  - Print summary at the end for multiple target URLs ([#13](https://github.com/patrickkfkan/patreon-dl/issues/13))

v1.3.0
- Add support for multiple target URLs
- Add `content.publishDate` field to the content dir name format ([PR #12](https://github.com/patrickkfkan/patreon-dl/pull/12) by [kazuoteramoto](https://github.com/kazuoteramoto))
- Bug fixes

v1.2.2
- Fix wrong file extension for some content types
- Fix YouTube API requests throwing errors due to YT changes

v1.2.1
- Bug fixes

v1.2.0
- Add support for granular control over:
  - posts to include in download based on type of media contained
  - the type of media to download
- Bug fixes

v1.1.1
- Fix initial data parsing following Patreon changes

v1.1.0
- Add support for downloading embedded YouTube videos

v1.0.1
- Fix missing types when importing as library
- Fix link in this README

v1.0.0
- Initial release
