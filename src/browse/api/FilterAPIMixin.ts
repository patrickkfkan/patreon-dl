import { type APIConstructor } from ".";
import { PostType } from "../../entities/Post.js";
import { type FilterData, type FilterOption, type FilterSection, type MediaFilterSearchParams, type PostFilterSearchParams, type ProductFilterSearchParams } from "../types/Filter.js";
import { type ContentListSortBy } from "../types/Content.js";
import { type MediaListSortBy } from "../types/Media.js";

export function FilterAPIMixin<TBase extends APIConstructor>(Base: TBase) {
  return class FilterAPI extends Base {
    async getPostFilterData(
      campaignId: string
    ): Promise<FilterData<PostFilterSearchParams>> {
      const postCountByTier = await this.db.getPostCountByTier(campaignId);
      const postCountByType = await this.db.getPostCountByType(campaignId);
      const postCountByYear = await this.db.getContentCountByDate('post', 'year', {
        campaign: campaignId
      });
      const postCountThisMonth = (await this.db.getContentCountByDate('post', 'month', {
        campaign: campaignId,
        date: new Date()
      }))[0];

      const sections: FilterSection<PostFilterSearchParams>[] = [];

      const postTypeRecords = postCountByType.map<FilterOption & { count: number; }>(({ postType, count }) => ({
        title: this.#getPostTypeTitle(postType),
        count,
        value: postType
      }))
      .reduce<Record<string, { count: number, value: string; }>>((result, option) => {
        if (option.value) {
          if (result[option.title]) {
            result[option.title].count += option.count;
            result[option.title].value += `,${option.value}`;
          }
          else {
            result[option.title] = { 
              count: option.count,
              value: option.value
            };
          }
        }
        return result;
      }, {});
      const postTypeOptions: FilterOption[] = [];
      for (const [title, { count, value }] of Object.entries(postTypeRecords)) {
        postTypeOptions.push({
          title: `${title} (${count})`,
          value
        });
      }
      if (postTypeOptions.length > 0) {
        sections.push({
          title: 'Post type',
          displayHint: 'pill',
          searchParam: 'post_types',
          options: postTypeOptions
        });
      }

      const postAccessOptions: FilterOption[] = [
        {
          title: 'Posts you have access to',
          value: 'true',
        },
        {
          title: 'All posts',
          value: null,
          isDefault: true,
        }
      ];
      sections.push({
        title: 'Post access',
        displayHint: 'list',
        searchParam: 'is_viewable',
        options: postAccessOptions
      });

      const tierOptions = postCountByTier.map<FilterOption>(({tierId, title, count}) => ({
        title: `${title || (tierId === '-1' ? 'Public' : title)} (${count})`,
        value: tierId,
      }));
      tierOptions.unshift({
        title: 'Any tier',
        value: null,
        isDefault: true
      });
      sections.push({
        displayHint: 'list',
        searchParam: 'tier_ids',
        options: tierOptions
      });

      const sortByOptions: FilterOption[] = [
        {
          title: 'Latest',
          value: 'latest' satisfies ContentListSortBy,
          isDefault: true
        },
        {
          title: 'Oldest',
          value: 'oldest' satisfies ContentListSortBy,
        },
        {
          title: 'A-Z',
          value: 'a-z' satisfies ContentListSortBy,
        },
        {
          title: 'Z-A',
          value: 'z-a' satisfies ContentListSortBy,
        }
      ];
      sections.push({
        title: 'Sort by',
        displayHint: 'list',
        searchParam: 'sort_by',
        options: sortByOptions
      });

      const datePublishedOptions = postCountByYear.map<FilterOption>(({dt, count}) => ({
        title: `${dt} (${count})`,
        value: dt,
      }));
      if (postCountThisMonth?.count > 0) {
        datePublishedOptions.unshift({
          title: `This month (${postCountThisMonth.count})`,
          value: 'this_month',
        });
      }
      datePublishedOptions.unshift({
        title: 'Any date',
        value: null,
        isDefault: true
      });
      sections.push({
        title: 'Date published',
        displayHint: 'list',
        searchParam: 'date_published',
        options: datePublishedOptions
      });

      return { sections };
    }

    #getPostTypeTitle(postType: string) {
      switch (postType) {
        case PostType.Audio:
          return 'Audio';
        case PostType.Image:
          return 'Image';
        case PostType.Link:
          return 'Link';
        case PostType.Podcast:
          return 'Podcast';
        case PostType.Poll:
          return 'Poll';
        case PostType.Text:
          return 'Text';
        case PostType.Video:
        case PostType.VideoEmbed:
          return 'Video';
        default:
          return 'Other';
      }
    }

    async getProductFilterData(
      campaignId: string
    ): Promise<FilterData<ProductFilterSearchParams>> {
      const productCountByYear = await this.db.getContentCountByDate('product', 'year', {
        campaign: campaignId
      });
      const productCountThisMonth = (await this.db.getContentCountByDate('product', 'month', {
        campaign: campaignId,
        date: new Date()
      }))[0];

      const sections: FilterSection<ProductFilterSearchParams>[] = [];
      
      const productAccessOptions: FilterOption[] = [
        {
          title: 'Products you have access to',
          value: 'true',
        },
        {
          title: 'All products',
          value: null,
          isDefault: true,
        }
      ];
      sections.push({
        title: 'Product access',
        displayHint: 'list',
        searchParam: 'is_viewable',
        options: productAccessOptions
      });

      const sortByOptions: FilterOption[] = [
        {
          title: 'Latest',
          value: 'latest' satisfies ContentListSortBy,
          isDefault: true
        },
        {
          title: 'Oldest',
          value: 'oldest' satisfies ContentListSortBy,
        },
        {
          title: 'A-Z',
          value: 'a-z' satisfies ContentListSortBy,
        },
        {
          title: 'Z-A',
          value: 'z-a' satisfies ContentListSortBy,
        }
      ];
      sections.push({
        title: 'Sort by',
        displayHint: 'list',
        searchParam: 'sort_by',
        options: sortByOptions
      });

      const datePublishedOptions = productCountByYear.map<FilterOption>(({dt, count}) => ({
        title: `${dt} (${count})`,
        value: dt,
      }));
      if (productCountThisMonth?.count > 0) {
        datePublishedOptions.unshift({
          title: `This month ${productCountThisMonth.count}`,
          value: 'this_month',
        });
      }
      datePublishedOptions.unshift({
        title: 'Any date',
        value: null,
        isDefault: true
      });
      sections.push({
        title: 'Date published',
        displayHint: 'list',
        searchParam: 'date_published',
        options: datePublishedOptions
      });

      return { sections };
    }

    async getMediaFilterData(
      campaignId: string
    ): Promise<FilterData<MediaFilterSearchParams>> {
      const mediaCountByTier = await this.db.getMediaCountByTier(campaignId);
      const mediaCountByType = await this.db.getMediaCountByContentType(campaignId);
      const mediaCountByYear = await this.db.getMediaCountByDate('year', {
        campaign: campaignId
      });
      const postCountThisMonth = (await this.db.getMediaCountByDate('month', {
        campaign: campaignId,
        date: new Date()
      }))[0];

      const sections: FilterSection<MediaFilterSearchParams>[] = [];

      const sourceTypeRecords = mediaCountByType.map<FilterOption & { count: number; }>(({ contentType, count }) => ({
        title: contentType === 'post' ? 'Posts' : 'Products',
        count,
        value: contentType
      }))
      .reduce<Record<string, { count: number, value: string; }>>((result, option) => {
        if (option.value) {
          if (result[option.title]) {
            result[option.title].count += option.count;
            result[option.title].value += `,${option.value}`;
          }
          else {
            result[option.title] = { 
              count: option.count,
              value: option.value
            };
          }
        }
        return result;
      }, {});
      const sourceTypeOptions: FilterOption[] = [];
      for (const [title, { count, value }] of Object.entries(sourceTypeRecords)) {
        sourceTypeOptions.push({
          title: `${title} (${count})`,
          value
        });
      }
      if (sourceTypeOptions.length > 0) {
        sections.push({
          title: 'Show media from',
          displayHint: 'pill',
          searchParam: 'source_type',
          options: sourceTypeOptions
        });
      }

      const mediaAccessOptions: FilterOption[] = [
        {
          title: 'Media you have access to',
          value: 'true',
        },
        {
          title: 'All media',
          value: null,
          isDefault: true,
        }
      ];
      sections.push({
        title: 'Media access',
        displayHint: 'list',
        searchParam: 'is_viewable',
        options: mediaAccessOptions
      });

      if (sourceTypeOptions.find((o) => o.value === 'post')) {
        const tierOptions = mediaCountByTier.map<FilterOption>(({tierId, title, count}) => ({
          title: `${title || (tierId === '-1' ? 'Public' : title)} (${count})`,
          value: tierId,
        }));
        tierOptions.unshift({
          title: 'Any tier',
          value: null,
          isDefault: true
        });
        const tierSection: FilterSection<MediaFilterSearchParams> = {
          displayHint: 'list',
          searchParam: 'tier_ids',
          options: tierOptions
        };
        const hasProductSourceType = sourceTypeOptions.find((o) => o.value === 'product');
        if (hasProductSourceType) {
          tierSection.enableCondition = {
            searchParam: 'source_type',
            condition: 'not',
            value: 'post'
          };
        }
        sections.push(tierSection);
      }

      const sortByOptions: FilterOption[] = [
        {
          title: 'Latest',
          value: 'latest' satisfies MediaListSortBy,
          isDefault: true
        },
        {
          title: 'Oldest',
          value: 'oldest' satisfies MediaListSortBy,
        }
      ];
      sections.push({
        title: 'Sort by',
        displayHint: 'list',
        searchParam: 'sort_by',
        options: sortByOptions
      });

      const datePublishedOptions = mediaCountByYear.map<FilterOption>(({dt, count}) => ({
        title: `${dt} (${count})`,
        value: dt,
      }));
      if (postCountThisMonth?.count > 0) {
        datePublishedOptions.unshift({
          title: `This month (${postCountThisMonth.count})`,
          value: 'this_month',
        });
      }
      datePublishedOptions.unshift({
        title: 'Any date',
        value: null,
        isDefault: true
      });
      sections.push({
        title: 'Date published',
        displayHint: 'list',
        searchParam: 'date_published',
        options: datePublishedOptions
      });

      return { sections };
    }
  }
}