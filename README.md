<a href='https://ko-fi.com/C0C5RGOOP' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi2.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

# patreon-dl

A Patreon downloader written in [Node.js](https://nodejs.org).

### Features
- Access to patron-only content through cookie
- Download posts by user, in a collection or single post
- Download products (aka shop purchases)
- Items included in downloads:
    - videos
    - images
    - audio
    - attachments
- Save campaign and content info 
- Extensively configurable

You can run `patreon-dl` from the command-line or use it as a library for your project. Node.js v16.16.0 or higher required.

### Limitations

- Embedded videos, other than those from YouTube, are not supported (e.g. Vimeo). Only info about these embeds is saved.
- Likewise, embedded links are not followed; only info about the embed is saved.

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

For library usage, see [Configuring YouTube connection](#configuring-youtube-connection).

## Installation

```
npm i -g patreon-dl
```

The `-g` option is for installing `patreon-dl` globally and have the CLI executable added to the PATH. Depending on your usage, you might not need this.

## CLI usage

```
$ patreon-dl [OPTION]... URL

Options

  -h, --help                 Display this usage guide                           
  -C, --config-file <file>   Load configuration file for setting full options   
  -c, --cookie <string>      Cookie for accessing patron-only content           
  -f, --ffmpeg <string>      Path to FFmpeg executable                          
  -o, --out-dir <dir>        Path to directory where content is saved           
  -l, --log-level <level>    Log level of the console logger: 'info', 'debug',  
                             'warn' or 'error'; set to 'none' to disable the    
                             logger.                                            
  -y, --no-prompt            Do not prompt for confirmation to proceed          
  --configure-youtube        Configure YouTube connection 
```

#### Supported URL formats

```
// Product
https://www.patreon.com/<creator>/shop/<slug>-<product_id>

// Posts
https://www.patreon.com/<creator>/posts

// Single post
https://www.patreon.com/posts/<slug>-<post_id>

// Posts in collection
https://www.patreon.com/collection/<collection_id>

```

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

## Library usage

To use `patreon-dl` in your own project:

```
import PatreonDownloader from 'patreon-dl';

const url = '....';

const downloader = await PatreonDownloader.getInstance(url, [options]);

await downloader.start();
```

Here, we first obtain a downloader instance by calling `PatreonDownloader.getInstance()`, passing to it the URL we want to download from (one of the [supported URL formats](#supported-url-formats)) and [downloader options](#downloader-options), if any.

Then, we call `start()` on the downloader instance to begin the download process. The `start()` method returns a Promise that resolves when the download process has ended.
- To monitor status and progress, see [Workflow and Events](#workflow-and-events).
- To abort a download process, see [Aborting](#aborting).

### Downloader options

An object with the following properties (all *optional*):

| Option          | Description                                                 |
|-----------------|-------------------------------------------------------------|
| `cookie`          | Cookie to include in requests; required for accessing patron-only content. See [How to obtain Cookie](https://github.com/patrickkfkan/patreon-dl/wiki/How-to-obtain-Cookie). |
| `useStatusCache`  | Whether to use status cache to quickly determine whether a target that had been downloaded before has changed since the last download. Default: `true` |
| `pathToFFmpeg`    | Path to `ffmpeg` executable. If not specified, `ffmpeg` will be called directly when needed, so make sure it is in the PATH. |
| `pathToYouTubeCredentials` | Path to file storing YouTube credentials for connecting to a YouTube account when downloading embedded YouTube videos. Its purpose is to allow YouTube Premium accounts to download videos at higher than normal qualities. For more information, see [Configuring YouTube connection](#configuring-youtube-connection).
| `outDir`          | Path to directory where content is saved. Default: current working directory |
| `dirNameFormat`   | How to name directories: (object)<ul><li>`campaign`: see [Campaign directory name format](#campaign-directory-name-format)</li><li>`content`: see [Content directory name format](#content-directory-name-format)</li></ul> |
| `filenameFormat`  | Naming of files: (object)<ul><li>`media`: see [Media filename format](#media-filename-format) |
| `include`         | What to include in the download: (object) <ul><li>`lockedContent`: whether to process locked content. Default: `true`</li><li>`postsWithMediaType`: sets the media type criteria for downloading posts. Values can be:<ul><li>`any`: download posts regardless of the type of media they contain. Also applies to posts that do not contain any media.</li><li>`none`: only download posts that do not contain media.</li><li>Array<`image` \| `video` \| `audio` \| `attachment`>: only download posts that contain the specified media type(s).</li></ul>Default: `any`</li><li>`campaignInfo`: whether to save campaign info. Default: `true`</li><li>`contentInfo`: whether to save content info. Default: `true`</li><li>`contentMedia`: the type of content media to download (images, videos, audio, attachments, excluding previews). Values can be:<ul><li>`true`: download all content media.</li><li>`false`: do not download content media.</li><li>Array<`image` \| `video` \| `audio` \| `attachment` \| `file`>: only download the specified media type(s).</li></ul>Default: `true`</li><li>`previewMedia`: the type of preview media to download, if available. Values can be:<ul><li>`true`: download all preview media.</li><li>`false`: do not download preview media.</li><li>Array<`image` \| `video` \| `audio`>: only download the specified media type(s).</li></ul>Default: `true`</li><li>`allMediaVariants`: whether to download all media variants, if available. If `false`, only the best quality variant will be downloaded. Default: `false`</li></ul> |
| `request`         | Rate limiting and retry on error: (object)<ul><li>`maxRetries`: maximum number of retries if a request or download fails. Default: 3</li><li>`maxConcurrent`: maximum number of concurrent downloads. Default: 10</li><li>`minTime`: minimum time to wait between starting requests or downloads (milliseconds). Default: 333</li></ul> |
| `fileExistsAction` | What to do when a target file already exists: (object)<ul><li>`info`: in the context of saving info (such as campaign or post info), the action to take when a file belonging to the info already exists. Default: `saveAsCopyIfNewer`</li><li>`infoAPI`: API data is saved as part of info. Because it changes frequently, and usually used for debugging purpose only, you can set a different action when saving an API data file that already exists. Default: `overwrite`</li><li>`content`: in the context of downloading content, the action to take when a file belonging to the content already exists. Default: `skip`</li></ul><p>Supported actions:<ul><li>`overwrite`: overwrite existing file.</li><li>`skip`: skip saving the file.</li><li>`saveAsCopy`: save the file under incremented filename (e.g. "abc.jpg" becomes "abc (1).jpg").</li><li>`saveAsCopyIfNewer`: like `saveAsCopy`, but only do so if the contents have actually changed.</li></ul></p> |
|`logger`           | See [Logger](#logger)                     | 

#### Campaign directory name format

Format to apply when naming campaign directories. A format is a string pattern consisting of fields enclosed in curly braces.

> ***What is a campaign directory?***
> <p>When you download content, a directory is created for the campaign that hosts the content. Content directories, which stores the downloaded content, are then placed under the campaign directory.
> If campaign info could not be obtained from content, then content directory
> will be created directly under <code>outDir</code>.</p>

A format must contain at least one of the following fields:
- `creator.vanity`
- `creator.name`
- `creator.id`
- `campaign.name`
- `campaign.id`

Characters enclosed in square brackets followed by a question mark denote
conditional separators. If the value of a field could not be obtained or
is empty, the conditional separator immediately adjacent to it will be
omitted from the name.

Default: '{creator.vanity}[ - ]?{campaign.name}'</br>
Fallback: 'campaign-{campaign.id}'

#### Content directory name format

Format to apply when naming content directories. A format is a string pattern consisting of fields enclosed in curly braces.

> ***What is a content directory?***
> <p>Content can be a post or product. A directory is created for each piece of content. Downloaded items for the content are placed under this directory.</p>

A format must contain at least one of the following unique identifier fields:
- `content.id`: ID of content
- `content.slug`: last segment of the content URL

In addition, a format can contain the following fields:
- `content.name`: post title or product name
- `content.type`: type of content ('product' or 'post')

Characters enclosed in square brackets followed by a question mark denote conditional separators. If the value of a field could not be obtained or is empty, the conditional separator immediately adjacent to it will be omitted from the name.

Default: '{content.id}[ - ]?{content.name}'</br>
Fallback: '{content.type}-{content.id}'

#### Media filename format

Filename format of a downloaded item. A format is a string pattern consisting of fields enclosed in curly braces.

A format must contain at least one of the following fields:
- `media.id`: ID of the item downloaded (assigned by Patreon)
- `media.filename`: can be one of the following, in order of availability:
  - original filename included in the item's API data; or
  - filename derived from the header of the response to the HTTP download request.

In addition, a format can contain the following fields:
- `media.type`: type of item (e.g. 'image' or 'video')
- `media.variant`: where applicable, the variant of the item (e.g. 'original', 'thumbnailSmall'...for images)

> If `media.variant` is not included in the format, it will be appended to it if `allMediaVariants` is `true`.

Sometimes `media.filename` could not be obtained, in which case it will be replaced with `media.id`, unless it is already present in the format.

Characters enclosed in square brackets followed by a question mark denote conditional separators. If the value of a field could not be obtained or is empty, the conditional separator immediately adjacent to it will be omitted from the name.

Default: '{media.filename}'</br>
Fallback: '{media.type}-{media.id}'

### Configuring YouTube connection

In its simplest form, the process of connecting `patreon-dl` to a YouTube account is as follows:

1. Obtain credentials by having the user visit a Google page that links his or her account to a 'device' (which in this case is actually `patreon-dl`).
2. Save the credentials, as a JSON string, to a file.
3. Pass the path of the file to `PatreonDownloader.getInstance()`

To obtain credentials, you can use the `YouTubeCredentialsCapturer` class:

```
import { YouTubeCredentialsCapturer } from 'patreon-dl';

// Note: you should wrap the following logic inside an async
// process, and resolve when the credentials have been saved.

const capturer = new YouTubeCredentialsCapturer();

/**
 * 'pending' event emitted when verification data is ready and waiting
 * for user to carry out the verification process.
 */
capturer.on('pending', (data) => {
  // `data` is an object: { verificationURL: <string>, code: <string> }
  // Use `data` to provide instructions to the user:
  console.log(
    `In a browser, go to the following Verification URL and enter Code:

    - Verification URL: ${data.verificationURL}
    - Code: ${data.code}

    Then wait for this script to complete.`);
});

/**
 * 'capture' event emitted when the user has completed verification and the 
 * credentials have been relayed back to the capturer.
 */
capturer.on('capture', (credentials) => {
  // `credentials` is an object which you need to save to file as JSON string.
  fs.writeFileSync('/path/to/yt-credentials.json', JSON.stringify(credentials));
  console.log('Credentials saved!');
});

// When you have added the listeners, start the capture process.
capturer.begin();
```

Then, pass the path of the file to `PatreonDownloader.getInstance()`:

```
const downloader = await PatreonDownloader.getInstance(url, {
  ...
  pathToYouTubeCredentials: '/path/to/yt-credentials.json'
});
```

You should ensure the credentials file is writable, as it needs to be updated with new credentials when the current ones expire. The process of renewing credentials is done automatically by the downloader.

### Logger

Logging is optional, but provides useful information about the download process. You can implement your own logger by extending the `Logger` abstract class:

```
import { Logger } from 'patreon-dl';

class MyLogger extends Logger {

  log(entry) {
    // Do something with log entry
  }

  // Called when downloader ends, so you can
  // clean up the logger process if necessary.
  end() {
    // This is not an abstract function, so you don't have to
    // implement it if there is no action to be taken here. Default is
    // to resolve right away.
    return Promise.resolve();
  }
}
```

Each entry passed to `log()` is an object with the following properties:
- `level`: `info`, `debug`, `warn` or `error`, indicating the severity of the log message.
- `originator`: (string or `undefined`) where the message is coming from.
- `message`: array of elements comprising the message. An element can be anything such as a string, Error or object.

#### Built-in loggers

The `patreon-dl` library comes with the following `Logger` implementations that you may utilize:

- `ConsoleLogger`

    Outputs messages to the console:

    ```
    import { ConsoleLogger } from 'patreon-dl';

    const myLogger = new ConsoleLogger([options]);

    const downloader = await PatreonDownloader.getInstance(url, {
        ...
        logger: myLogger
    });
    
    ```

    `options`: (object)

    | Option        | Description                                    |
    |---------------|------------------------------------------------|
    | `enabled`     | Whether to enable this logger. Default: `true` |
    | `logLevel`    | <p>`info`, `debug`, `warn` or `error`. Default: `info`</p><p>Output messages up to the specified severity level.</p> |
    | `include`     | What to include in log messages: (object)<ul><li>`dateTime`: show date / time of log messages. Default: `true`</li><li>`level`: show the severity level. Default: `true`</li><li>`originator`: show where the messsage came from. Default: `true`</li><li>`errorStack`: for Errors, whether to show the full error stack. Default: `false`</li></ul> |
    | `dateTimeFormat` | <p>The pattern to format data-time strings, when `include.dateTime` is `true`.</p><p>Date-time formatting is provided by [dateformat](https://github.com/felixge/node-dateformat) library. Refer to the README of that project for pattern rules.</p><p>Default: 'mmm dd HH:MM:ss'</p> |


- `FileLogger`

    Like `ConsoleLogger`, but writes messages to file.

    ```
    import { FileLogger } from 'patreon-dl';

    const myLogger = new FileLogger(init, [options]);

    const downloader = await PatreonDownloader.getInstance(url, {
        ...
        logger: myLogger
    });
    ```

    `init`: values that determine the name of the log file (object)
    
    | Property       | Description                                   |
    |----------------|-----------------------------------------------|
    | `targetURL`    | The url passed to `PatreonDownloader.getInstance()` |
    | `outDir`       | Value of `outDir` specified in `PatreonDownloader.getInstance()` options, or `undefined` if none specified (in which case defaults to current working directory). |
    | `date`         | <p>(*optional*) `Date` instance representing the creation date / time of the logger. Default: current date-time</p><p>You might want to provide this if you are creating multiple `FileLogger` instances and filenames are to be formatted with the date, otherwise the date-time part of the filenames might have different values.</p>|

    `options`: all `ConsoleLogger` options plus the following:

    | Option         | Description                                   |
    |----------------|-----------------------------------------------|
    | `logDir`       | <p>Path to directory of the log file.</p><p>The path can be a string pattern consisting of the following fields enclosed in curly braces:<ul><li>`out.dir`: value of `outDir` provided in `init` (or the default current working directory if none provided).</li><li>`target.url.path`: the pathname of `targetURL` provided in `init`, sanitized as necessary.</li><li>`datetime.<date-time format>`: the date-time of logger creation, as represented by `date` in `init` and formatted according to `<date-time format>` (using pattern rules defined by the [dateformat](https://github.com/felixge/node-dateformat) library).</li></ul></p> |
    | `logFilename`  | <p>Name of the log file.</p><p>The path can be a string pattern consisting of the following fields enclosed in curly braces:<ul><li>`target.url.path`: the pathname of `targetURL` provided in `init`, sanitized as necessary.</li><li>`datetime.<date-time format>`: the date-time of logger creation, as represented by `date` in `init` and formatted according to `<date-time format>` (using pattern rules defined by the [dateformat](https://github.com/felixge/node-dateformat) library).</li></ul></p><p>Default: '{datetime.yyyymmdd}-{log.level}.log'</p> |
    | `fileExistsAction` | <p>What to do if log file already exists? One of the following values: <ul><li>`append`: append logs to existing file</li><li>`overwrite`: overwrite the existing file</li></ul></p><p>Default: `append`</p> |

- `ChainLogger`

    Combines multiple loggers into one single logger.

    ```
    import { ConsoleLogger, FileLogger, ChainLogger } from 'patreon-dl';

    const consoleLogger = new ConsoleLogger(...);
    const fileLogger = new FileLogger(...);
    const chainLogger = new ChainLogger([ consoleLogger, fileLogger ]);

    const downloader = await PatreonDownloader.getInstance(url, {
        ...
        logger: chainLogger
    });
    ```

### Aborting

To prematurely end a download process, use `AbortController` to send an abort signal to the downloader instance.

```
const downloader = await PatreonDownloader.getInstance(...);
const abortController = new AbortController();
downloader.start({
    signal: abortController.signal
});

...

abortController.abort();

// Downloader aborts current and pending tasks, then ends.
```

### Workflow and Events

#### Workflow

1. Downloader analyzes given URL and determines what targets to fetch.
2. Downloader begins fetching data from Patreon servers. Emits `fetchBegin` event.
2. Downloader obtains the target(s) from the fetched data for downloading.
3. For each target (which can be a campaign, product or post):
    1. Downloader emits `targetBegin` event.
    2. Downloader determines whether the target needs to be downloaded, based on downloader configuration and target info such as accessibility.
        - If target is to be skipped, downloader emits `targetEnd` event with `isSkipped: true`. It then proceeds to the next target, if any.
    3. If target is to be downloaded, downloader saves target info (subject to downloader configuration), and emits `phaseBegin` event with `phase: saveInfo`. When done, downloader emits `phaseEnd` event.
    3. Downloader begins saving media belonging to target (again, subject to downloader configuration). Emits `phaseBegin` event with `phase: saveMedia`.
        1. Downloader saves files that do not need to be downloaded, e.g. embedded video / link info.
        2. Downloader proceeds to download files (images, videos, audio, attachments, etc.) belonging to the target in batches. For each batch, downloader emits `phaseBegin` event with `phase: batchDownload`. When done, downloader emits `phaseEnd` event with `phase: batchDownload`.
            - In this `phaseBegin` event, you can attach listeners to the download batch to monitor events for each download. See [Download Task Batch](#download-task-batch).
    4. Downloader emits `phaseEnd` event with `phase: saveMedia`.
    5. Downloader emits `targetEnd` event with `isSkipped: false`, and proceeds to the next target.
4. When there are no more targets to be processed, or a fatal error occurred, downloader ends with `end` event.

#### Events

```
const downloader = await PatreonDownloader.getInstance(...);

downloader.on('fetchBegin', (payload) => {
    ...
});

downloader.start();
```

Each event emitted by a `PatreonDownloader` instance has a payload, which is an object with properties containing information about the event.


| Event         | Description                                   |
|---------------|-----------------------------------------------|
| `fetchBegin`  | <p>Emitted when downloader begins fetching data about target(s).<p><p>Payload properties:<ul><li>`targetType`: the type of target being fetched; one of `product`, `post` or `post`.</li></ul></p> |
| `targetBegin` | <p>Emitted when downloader begins processing a target.</p><p>Payload properties:<ul><li>`target`: the target being processed; one of [Campaign](./docs/api/interfaces/Campaign.md), [Product](./docs/api/interfaces/Product.md) or [Post](./docs/api/interfaces/Post.md).</li></ul></p> |
| `targetEnd`   | <p>Emitted when downloader is done processing a target.</p><p>Payload properties:<ul><li>`target`: the target processed; one of [Campaign](./docs/api/interfaces/Campaign.md), [Product](./docs/api/interfaces/Product.md) or [Post](./docs/api/interfaces/Post.md).</li><li>`isSkipped`: whether target was skipped.</li></ul></p><p>If `isSkipped` is `true`, the following additional properties are available:<ul><li>`skipReason`: the reason for skipping the target; one of the following enums:<ul><li>`TargetSkipReason.Inaccessible`</li><li>`TargetSkipReason.AlreadyDownloaded`</li><li>`TargetSkipReason.UnmetMediaTypeCriteria`</li></ul></li><li>`skipMessage`: description of the skip reason.</li></ul></p> |
| `phaseBegin`  | <p>Emitted when downloader begins a phase in the processing of a target.</p><p>Payload properties:<ul><li>`target`: the subject target of the phase; one of [Campaign](./docs/api/interfaces/Campaign.md), [Product](./docs/api/interfaces/Product.md) or [Post](./docs/api/interfaces/Post.md).</li><li>`phase`: the phase that is about to begin; one of `saveInfo` or `batchDownload`.</li></ul></p><p>If `phase` is `batchDownload`, the following additional property is available:<ul><li>`batch`: an object representing the batch of downloads to be executed by the downloader. For monitoring downloads in the batch, see [Download Task Batch](#download-task-batch).</li></ul></p> |
| `phaseEnd`    | <p>Emitted when a phase ends for a target.</p><p>Payload properties:<ul><li>`target`: the subject target of the phase; one of [Campaign](./docs/api/interfaces/Campaign.md), [Product](./docs/api/interfaces/Product.md) or [Post](./docs/api/interfaces/Post.md).</li><li>`phase`: the phase that has ended; one of `saveInfo` or `batchDownload`.</li></ul></p> |
| `end`         | <p>Emitted when downloader ends.</p><p>Payload properties:<ul><li>`aborted`: boolean indicating whether the downloader is ending because of an abort request</li><li>`error`: if downloader ends because of an error, then `error` will be the captured error. Note that `error` is not necessarily an `Error` object; it can be anything other than `undefined`.</li></ul></p> |

### Download Task Batch

Files are downloaded in batches. Each batch is provided in the payload of `phaseBegin` event with `phase: batchDownload`. You can monitor events of individual downloads in the batch as follows:

```
downloader.on('phaseBegin', (payload) => {
    if (payload.phase === 'batchDownload') {
        const batch = payload.batch;
        batch.on(event, listener);
    }
})
```

Note that you don't have to remove listeners yourself. They will be removed once the batch ends and is destroyed by the downloader.

#### Download Task

Each download task in a batch is represented by an object with the following properties:

| Property      | Description                           |
|---------------|---------------------------------------|
| `id`          | ID assigned to the task.               |
| `src`         | The source of the download; URL or otherwise file path if downloading video from a previously-downloaded `m3u8` playlist. |
| `srcEntity`   | The [Downloadable](./docs/api/README.md#downloadable) item from which the download task was created. |
| `retryCount`  | The current retry count if download failed previously. |
| `resolvedDestFilename` | The resolved destination filename of the download, or `null` if it has not yet been resolved. |
| `resolvedDestFilename` | The resolved destination file path of the download, or `null` if it has not yet been reoslved. |
| `getProgress()` | Function that returns the download progress. |

#### Events

Each event emitted by a download task batch has a payload, which is an object with properties containing information about the event.

| Event         | Description                           |
|---------------|---------------------------------------|
| `taskStart`   | <p>Emitted when a download starts.</p><p>Payload properties:<ul><li>`task`: the download task</li></ul></p> |
| `taskProgress`| <p>Emitted when a download progress is updated.</p><p>Payload properties:<ul><li>`task`: the download task</li><li>`progress`: (object)<ul><li>`destFilename`: the destination filename of the download</li><li>`destFilePath`: the destination file path of the download</li><li>`lengthUnit`: the unit measuring the progress. Generally, it would be 'byte', but for videos the unit would be 'second'.</li><li>`length`: length downloaded, measured in `lengthUnit`.</li><li>`percent`: percent downloaded</li><li>`sizeDownloaded`: size of file downloaded (kb)</li><li>`speed`: download speed (kb/s)</li></ul></li></ul></p> |
| `taskComplete` | <p>Emitted when a download is complete.</p><p>Payload properties:<ul><li>`task`: the download task</li></ul></p> |
| `taskError` | <p>Emitted when a download error occurs.</p><p>Payload properties:<ul><li>`error`: (object)<ul><li>`task`: the download task</li><li>`cause`: `Error` object or `undefined`</li></ul></li><li>`willRetry`: whether the download will be reattempted</li></ul></p> |
| `taskAbort`   | <p>Emitted when a download is aborted.</p><p>Payload properties:<ul><li>`task`: the download task</li></ul></p> |
| `taskSkip`    | <p>Emitted when a download is skipped.</p><p>Payload properties:<ul><li>`task`: the download task</li><li>`reason`: (object)<ul><li>`name`: `destFileExists` or `other`</li><li>`message`: string indicating the skip reason</li></ul></li></ul></p><p>If `reason.name` is `destFileExists`, `reason` will also contain the following property:<ul><li>`existingDestFilePath`: the existing file path that is causing the download to skip</li></ul></p> |
| `taskSpawn`   | <p>Emitted when a download task is spawned from another task.</p><p>Payload properties:<ul><li>`origin`: the original download task</li><li>`spawn`: the spawned download task</li></ul></p> |
| `complete` | <p>Emitted when the batch is complete and there are no more downloads pending.</p><p>Payload properties: *none*</p> |

## Changelog

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
