import { type Campaign } from '../entities/Campaign.js';
import { type MediaLike } from '../entities/MediaItem.js';
import { type Product } from '../entities/Product.js';
import Formatter, { type FormatFieldName, type FormatFieldRules, type FormatFieldValues } from './Formatter.js';
import URLHelper from './URLHelper.js';
import { type Attachment } from '../entities/Attachment.js';
import { type Post } from '../entities/Post.js';
import { toISODate } from './Misc.js';
import FSHelper from './FSHelper.js';

type CampaignDirNameFormatFieldName =
  'creator.vanity' |
  'creator.name' |
  'creator.id' |
  'campaign.name' |
  'campaign.id';

export const CAMPAIGN_DIR_NAME_VALIDATION_SCHEMA: FormatFieldRules<CampaignDirNameFormatFieldName> = [
  { name: 'creator.vanity', atLeastOneOf: true },
  { name: 'creator.name', atLeastOneOf: true },
  { name: 'creator.id', atLeastOneOf: true },
  { name: 'campaign.name', atLeastOneOf: true },
  { name: 'campaign.id', atLeastOneOf: true }
];

type ContentDirNameFormatFieldName =
  'content.id' |
  'content.type' |
  'content.slug' |
  'content.name' |
  'content.publishDate';

export const CONTENT_DIR_NAME_VALIDATION_SCHEMA: FormatFieldRules<ContentDirNameFormatFieldName> = [
  { name: 'content.id', atLeastOneOf: true },
  { name: 'content.type', atLeastOneOf: false },
  { name: 'content.slug', atLeastOneOf: true },
  { name: 'content.name', atLeastOneOf: false },
  { name: 'content.publishDate', atLeastOneOf: false }
];

type MediaFilenameFormatFieldName =
  'media.id' |
  'media.type' |
  'media.filename' |
  'media.variant';

export const MEDIA_FILENAME_VALIDATION_SCHEMA: FormatFieldRules<MediaFilenameFormatFieldName> = [
  { name: 'media.id', atLeastOneOf: true },
  { name: 'media.type', atLeastOneOf: false },
  { name: 'media.filename', atLeastOneOf: true },
  { name: 'media.variant', atLeastOneOf: false }
];

const CAMPAIGN_DIR_NAME_FALLBACK_FORMAT = 'campaign-{campaign.id}';
const CONTENT_DIR_NAME_FALLBACK_FORMAT = '{content.type}-{content.id}';
const MEDIA_FILENAME_FALLBACK_FORMAT = '{media.type}-{media.id}';

export default class FilenameFormatHelper {

  static getCampaignDirName(campaign: Campaign, format: string): string {
    const dict: FormatFieldValues<CampaignDirNameFormatFieldName> = {
      'creator.vanity': campaign.creator?.vanity,
      'creator.name': campaign.creator?.fullName,
      'creator.id': campaign.creator?.id,
      'campaign.name': campaign.name,
      'campaign.id': campaign.id
    };

    return this.#getFilename(format, dict, CAMPAIGN_DIR_NAME_VALIDATION_SCHEMA, CAMPAIGN_DIR_NAME_FALLBACK_FORMAT);
  }

  static getContentDirName(content: Product | Post, format: string): string {
    const dict: FormatFieldValues<ContentDirNameFormatFieldName> = {
      'content.id': content.id,
      'content.type': content.type,
      'content.slug': null,
      'content.name': null,
      'content.publishDate': content.publishedAt ? toISODate(content.publishedAt) : null
    };
    if (content.type === 'post') {
      const urlAnalysis = content.url ? URLHelper.analyzeURL(content.url) : null;
      dict['content.slug'] = urlAnalysis && urlAnalysis.type === 'post' ? urlAnalysis.slug : null;
      dict['content.name'] = content.title;
    }
    else if (content.type === 'product') {
      const urlAnalysis = URLHelper.analyzeURL(content.url);
      dict['content.slug'] = urlAnalysis && urlAnalysis.type === 'product' ? urlAnalysis.slug : null;
      dict['content.name'] = content.name;
    }

    return this.#getFilename(format, dict, CONTENT_DIR_NAME_VALIDATION_SCHEMA, CONTENT_DIR_NAME_FALLBACK_FORMAT);
  }

  static getMediaFilename(media: MediaLike & { variant: string | null }, format: string, ext: string): string {
    const dict: FormatFieldValues<MediaFilenameFormatFieldName> = {
      'media.id': media.id,
      'media.type': media.type,
      'media.filename': media.filename,
      'media.variant': media.variant
    };

    return this.#getFilename(format, dict, MEDIA_FILENAME_VALIDATION_SCHEMA, MEDIA_FILENAME_FALLBACK_FORMAT, ext);
  }

  static getAttachmentFilename(att: Attachment, format: string, ext: string): string {
    const dict: FormatFieldValues<MediaFilenameFormatFieldName> = {
      'media.id': att.id,
      'media.type': att.type,
      'media.filename': att.name,
      'media.variant': null
    };

    return this.#getFilename(format, dict, MEDIA_FILENAME_VALIDATION_SCHEMA, MEDIA_FILENAME_FALLBACK_FORMAT, ext);
  }

  static #getFilename<T extends FormatFieldName>(
    format: string,
    dict: FormatFieldValues<T>,
    rules: FormatFieldRules<T>,
    fallbackFormat: string,
    ext?: string
  ) {
    const { validateOK, result } = Formatter.format(format, dict, rules);
    let base = result;

    if (validateOK === false) {
      base = Formatter.format(fallbackFormat, dict).result;
    }

    return FSHelper.createFilename({ name: base, ext });
  }

  static validateCampaignDirNameFormat(format: string) {
    return Formatter.validate(format, CAMPAIGN_DIR_NAME_VALIDATION_SCHEMA);
  }

  static validateContentDirNameFormat(format: string) {
    return Formatter.validate(format, CONTENT_DIR_NAME_VALIDATION_SCHEMA);
  }

  static validateMediaFilenameFormat(format: string) {
    return Formatter.validate(format, MEDIA_FILENAME_VALIDATION_SCHEMA);
  }
}
