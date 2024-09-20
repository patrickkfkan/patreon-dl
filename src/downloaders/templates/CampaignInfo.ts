import { type Campaign } from '../../entities/Campaign.js';

const CAMPAIGN_INFO_TEMPLATE =
`Campaign
--------
ID: {campaign.id}
Name: {campaign.name}
Created: {campaign.createdAt}
Published: {campaign.publishedAt}
Summary: {campaign.summary}
URL: {campaign.url}

Creator
-------
ID: {campaign.creator.id}
Name: {campaign.creator.fullName}
Created: {campaign.creator.createdAt}
URL: {campaign.creator.url}
`;

const REWARD_INFO_TEMPLATE =
`Reward: {reward.title}
-------
ID: {reward.id}
Description: {reward.description}
Amount: {reward.amount}
Created: {reward.createdAt}
Published: {reward.publishedAt}
URL: {reward.url}

`;

const COMBINED_TEMPLATE =
`{campaign.info}
{rewards.info}
`;

export function generateCampaignSummary(campaign: Campaign) {
  const campaignInfo = CAMPAIGN_INFO_TEMPLATE
    .replaceAll('{campaign.id}', campaign.id)
    .replaceAll('{campaign.name}', campaign.name)
    .replaceAll('{campaign.createdAt}', campaign.createdAt || '')
    .replaceAll('{campaign.publishedAt}', campaign.publishedAt || '')
    .replaceAll('{campaign.summary}', campaign.summary || '')
    .replaceAll('{campaign.url}', campaign.url || '')
    .replaceAll('{campaign.creator.id}', campaign.creator?.id || '')
    .replaceAll('{campaign.creator.fullName}', campaign.creator?.fullName || '')
    .replaceAll('{campaign.creator.createdAt}', campaign.creator?.createdAt || '')
    .replaceAll('{campaign.creator.url}', campaign.creator?.url || '');

  const rewardSnippets: string[] = [];
  for (const reward of campaign.rewards) {
    const snippet = REWARD_INFO_TEMPLATE
      .replaceAll('{reward.id}', reward.id)
      .replaceAll('{reward.title}', reward.title || '')
      .replaceAll('{reward.description}', reward.description || '')
      .replaceAll('{reward.amount}', reward.amount || '')
      .replaceAll('{reward.createdAt}', reward.createdAt || '')
      .replaceAll('{reward.publishedAt}', reward.publishedAt || '')
      .replaceAll('{reward.url}', reward.url || '');
    rewardSnippets.push(snippet);
  }

  return COMBINED_TEMPLATE
    .replaceAll('{campaign.info}', campaignInfo)
    .replaceAll('{rewards.info}', rewardSnippets.join(''));
}
