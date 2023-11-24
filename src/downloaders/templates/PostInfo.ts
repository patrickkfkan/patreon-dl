import { Post, PostEmbed } from '../../entities/Post.js';

const POST_INFO_TEMPLATE =
`Post
--------
ID: {post.id}
Type: {post.type}
Title: {post.title}
Teaser: {post.teaser}
Content: {post.content}
Published: {post.publishedAt}
Last Edited: {post.editedAt}
URL: {post.url}
`;

const POST_EMBED_TEMPLATE =
`Embed
--------
Type: {embed.type}
Description: {embed.description}
HTML: {embed.html}
Provider: {embed.provider}
provider URL: {embed.providerURL}
Subject: {embed.subject}
URL: {embed.url}
`;

export function generatePostSummary(post: Post) {
  const postInfo = POST_INFO_TEMPLATE
    .replaceAll('{post.id}', post.id)
    .replaceAll('{post.type}', post.postType)
    .replaceAll('{post.title}', post.title || '')
    .replaceAll('{post.teaser}', post.teaserText || '')
    .replaceAll('{post.content}', post.content || '')
    .replaceAll('{post.publishedAt}', post.publishedAt || '')
    .replaceAll('{post.editedAt}', post.editedAt || '')
    .replaceAll('{post.url}', post.url || '');

  return postInfo;
}

export function generatePostEmbedSummary(embed: PostEmbed) {
  const embedInfo = POST_EMBED_TEMPLATE
    .replaceAll('{embed.type}', embed.type)
    .replaceAll('{embed.description}', embed.description || '')
    .replaceAll('{embed.html}', embed.html || '')
    .replaceAll('{embed.provider}', embed.provider || '')
    .replaceAll('{embed.providerURL}', embed.providerURL || '')
    .replaceAll('{embed.subject}', embed.subject || '')
    .replaceAll('{embed.url}', embed.url || '');

  return embedInfo;
}
