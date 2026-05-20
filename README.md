<a href='https://ko-fi.com/C0C5RGOOP' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi2.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

# patreon-dl

A Patreon downloader written in [Node.js](https://nodejs.org).

This repo contains the `patreon-dl` library and its command-line tool. For GUI application, check out [patreon-dl-gui](https://github.com/patrickkfkan/patreon-dl-gui).

### Features
- Access to patron-only content through cookie. This refers to content you have access to under your account. It does not include locked content that you don't have a subscription for.
- Download posts by user, in a collection or single post.
- Download products (aka shop purchases)
- Items included in downloads:
    - videos - but see [limitations](#limitations) on Patreon-hosted videos
    - images
    - audio
    - attachments
    - embedded videos
      - YouTube downloader built-in with configurable max resolution
      - Supports [external downloader](#embedded-videos--links---external-downloader)
- Save campaign and content info 
- Extensively configurable
- Browse downloaded content through integrated web server

You can run `patreon-dl` from the command-line or [use it as a library](./docs/Library.md) for your project. Node.js v20 or higher required.

### Limitations

**Embedded videos / links**

- Embedded links are not followed; only info about the embed is saved. Exception:
  - YouTube video link - in which case the video is downloaded; or
  - An external downloader is configured for the link provider.

For information on external downloaders, see the [Embedded videos / links - external downloader](#embedded-videos--links---external-downloader) section. Example config is provided for fetching YouTube (replacing the built-in downloader) and Vimeo videos.

**Patreon-hosted videos with DRM protection**

Some videos served by Patreon are now protected with DRM. Because these videos require a real-time decryption key available only during authorized streaming, they cannot be played back normally after being downloaded.

By default, `patreon-dl` will skip DRM-protected content to avoid broken downloads. If you still wish to download these files, you can force the download using:

- CLI: Use the `protected.media` option (see [example.conf](./example.conf)).
- Library: Use the `include.protectedMedia` option (see [documentation](./docs/Library.md)).

### FFmpeg dependency

[FFmpeg](https://ffmpeg.org) is required when downloading:
- videos that are provided only in streaming format; and
- embedded YouTube videos.

Not all video downloads require FFmpeg, but you should have it installed on your system anyway.

### Embedded YouTube videos / links

`patreon-dl` supports downloading embedded YouTube videos or from embedded YouTube video links.

#### Deno dependency

The built-in YouTube downloader runs code retrieved from YouTube or Google servers. If [Deno](https://deno.com/) is installed on your system, it will be used to execute this code within a secure, sandboxed environment. Without Deno, the code runs without isolation, increasing the risk of security vulnerabilities such as unauthorized access, data corruption, or malicious behavior. For this reason, installing Deno is strongly recommended.

When needed, the downloader will attempt to invoke the `deno` command. If it’s not found, it will default to unsafe execution. If Deno is installed but the `deno` executable isn’t available in your system’s PATH, you can manually specify its location using the `--deno` CLI option or `path.to.deno` config file option:

```
// CLI
$ patreon-dl --deno path/to/deno ...

// Config file
[downloader]
path.to.deno = "path/to/deno"
...
```

#### Premium access / "Login required" error

If you have a YouTube Premium subscription, you can connect `patreon-dl` to your account and download videos at qualities available only to Premium accounts (e.g. '1080p Premium'). You will also need to connect to an account (not necessarily Premium) if you get a "Login required" error message during download.

For CLI users, you would configure `patreon-dl` as follows:

```
$ patreon-dl --configure-youtube
```

### Embedded videos / links - external downloader

You can specify external programs to download embedded videos or from embedded links. For YouTube videos, this will replace the built-in downloader.

See the [example config](./example-embed.conf) on how to configure an external downloader to fetch YouTube, Vimeo and SproutVideo content through [yt-dlp](https://github.com/yt-dlp/yt-dlp). Helper scripts bundled with `patreon-dl` are used in the case of Vimeo and SproutVideo ([patreon-dl-vimeo.js](./bin/patreon-dl-vimeo.js) and [patreon-dl-sprout.js](./bin/patreon-dl-sprout.js) respectively).

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
| `--cookie <string>` | `-c` | Cookie for accessing patron-only content; [how to obtain cookie](https://github.com/patrickkfkan/patreon-dl/wiki/How-to-obtain-Cookie). Enclose within double quotation marks e.g. "Cookie: patreon_device_id:..."|
| `--ffmpeg <path>` | `-f` | Path to FFmpeg executable |
| `--deno <path>` | `-d` | Path to Deno executable |
| `--out-dir <path>` |`-o` | Directory to save content |
| `--log-level <level>` | `-l` | Log level of the console logger: `info`, `debug`, `warn` or `error`; set to `none` to disable the logger. |
| `--no-prompt` | `-y` | Do not prompt for confirmation to proceed |
| `--dry-run`   |      | Run without writing files to disk (except logs, if any). Intended for testing / debugging. |
| <code><nobr>--list-tiers &lt;creator&gt;</nobr></code> | | <p>List tiers for the given creator(s). Separate multiple creators with a comma.</p>The purpose of this is to let you find out what tier IDs to set for `posts.in.tier` filtering option under `include` section of [configuration file](#configuration-file). |
| <code><nobr>--list-tiers-uid &lt;user ID&gt;</nobr></code> | | Same as `--list-tiers`, but takes user ID instead of vanity. |
| <code><nobr>--list-posts &lt;creator&gt;</nobr></code> | | <p>List posts by the given creator(s). Separate multiple creators with a comma.</p> |
| <code><nobr>--list-posts-uid &lt;user ID&gt;</nobr></code> | | Same as `--list-posts`, but takes user ID instead of vanity. |
| `--configure-youtube` | | <p>Configure YouTube connection.</p>`patreon-dl` supports downloading embedded YouTube videos. If you have a YouTube Premium account, you can connect `patreon-dl` to it for downloading Premium-quality streams. You will also need to connect to an account if you get a "Login required" error message during download.|

### URL

#### Supported URL formats

```
// Download products from a creator's shop
https://www.patreon.com/<creator>/shop
https://www.patreon.com/c/<creator>/shop
https://www.patreon.com/cw/<creator>/shop

// Download a single product
https://www.patreon.com/<creator>/shop/<slug>-<product_id>

// Download posts by creator
https://www.patreon.com/<creator>/posts
https://www.patreon.com/c/<creator>/posts
https://www.patreon.com/cw/<creator>/posts
https://www.patreon.com/user/posts?u=<user_id>

// Dowload a single post
https://www.patreon.com/posts/<post_id>
https://www.patreon.com/posts/<slug>-<post_id>

// Download posts in a collection
https://www.patreon.com/collection/<collection_id>

```

#### Custom URLs

Some creators host their Patreon pages on custom domains. You can provide this custom URL to `patreon-dl`, which will download posts from the associated creator.

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
# include.protected.media
# include.all.media.variants
# include.images.by.filename
# include.audio.by.filename
# include.attachments.by.filename
# include.comments

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

## Browsing downloaded content

`patreon-dl` comes with a web server that allows you to browse downloaded content. To start the web server:

```
$ patreon-dl-server [OPTION]
```

### OPTION

| Option    | Alias | Description |
|-----------|-------|-------------|
| `--help`  | `-h`  | Display usage guide |
| `--data-dir <dir>` |`-i` | Directory containing downloaded content. Default: current working directory |
| `--port <number>` |`-p` | Web server port. Default: `3000`, or a random port if `3000` is already in use. |
| `--log-level <level>` | `-l` | Log level of the console logger: `info`, `debug`, `warn` or `error`; set to `none` to disable the logger. Default: `info` |
| `--log-file <file>` | `-f` | Save logs to `<file>`. |


### Example usage

Say you downloaded something with `patreon-dl`:

```
$ patreon-dl -o "C:\PatreonDownloads" <url>
```

This will download content to `C:\PatreonDownloads`. To view the downloaded content, start `patreon-dl` server as follows:

```
$ patreon-dl-server -i "C:\PatreonDownloads"

...info: Web server is running on <URL>
```

Note the URL shown in the output. Open this URL in a web browser to begin viewing the downloaded content.

> Keep in mind that the web server is in no way secure. It is meant for local browsing and should not be exposed to outside parties!

## Changelog

3.9.0
- Fix "initial data not found" error for certain targets ([#134](https://github.com/patrickkfkan/patreon-dl/issues/134)).
- Fix order of images in post content ([patreon-dl-gui#60](https://github.com/patrickkfkan/patreon-dl-gui/issues/60)).
- Support `media.index` field in `media.filename.format`.
- Handle conditional separators properly in filename format patterns.
- Browse: use slugified links.
- Minor bug fixes.

See the [full changelog](./CHANGELOG.md) for older versions.

---
This project is licensed under the MIT License and includes third-party software—see the [NOTICE](./NOTICE) file for attributions.
