import { Song } from '@/domain/models';

export const normalizeSearchText = (value = ''): string => value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}]/gu, '');

const songCollator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

export const compareSongsForSearch = (first: Song, second: Song): number =>
    songCollator.compare(normalizeSearchText(first.name), normalizeSearchText(second.name)) ||
    songCollator.compare(normalizeSearchText(first.author), normalizeSearchText(second.author));