import { PartialSourceManga } from '@paperback/types'
import { MDImageQuality } from './MangaDexHelper'
import { MangaItem, ChapterItem } from './MangaDexInterfaces'


export const parseMangaList = async (object: MangaItem[], source: any, thumbnailSelector: any): Promise<PartialSourceManga[]> => {
    const results: PartialSourceManga[] = []

    for (const manga of object) {
        const mangaId = manga.id
        const mangaDetails = manga.attributes
        const title = source.decodeHTMLEntity(mangaDetails.title.en ?? mangaDetails.altTitles.map(x => Object.values(x).find((v) => v !== undefined)).find((t) => t !== undefined))
        const coverFileName = manga.relationships.filter((x) => x.type == 'cover_art').map((x) => x.attributes?.fileName)[0]
        const image = coverFileName ? `${source.COVER_BASE_URL}/${mangaId}/${coverFileName}${MDImageQuality.getEnding(await thumbnailSelector(source.stateManager))}` : 'https://mangadex.org/_nuxt/img/cover-placeholder.d12c3c5.jpg'
        const subtitle = `${mangaDetails.lastVolume ? `Vol. ${mangaDetails.lastVolume}` : ''} ${mangaDetails.lastChapter ? `Ch. ${mangaDetails.lastChapter}` : ''}`

        results.push(
            App.createPartialSourceManga({
                mangaId: mangaId,
                title: title,
                image: image,
                subtitle: subtitle
            })
        )
    }
    return results
}

export const parseChapterListToManga = async (chapters: ChapterItem[], includedManga: MangaItem[], source: any, thumbnailSelector: any): Promise<PartialSourceManga[]> => {
    const results: PartialSourceManga[] = []
    const discoveredManga: Set<string> = new Set<string>()

    for (const chapter of chapters) {
        const mangaId = chapter.relationships.filter((x) => x.type == 'manga')[0]?.id

        if (!mangaId) {
            continue
        }

        const manga = includedManga.find((x) => x.id == mangaId)
        if (!manga) {
            continue
        }

        const mangaDetails = manga.attributes
        const title = source.decodeHTMLEntity(mangaDetails.title.en ?? mangaDetails.altTitles.map(x => Object.values(x).find((v) => v !== undefined)).find((t) => t !== undefined))
        const coverFileName = manga.relationships.filter((x) => x.type == 'cover_art').map((x) => x.attributes?.fileName)[0]
        const image = coverFileName ? `${source.COVER_BASE_URL}/${mangaId}/${coverFileName}${MDImageQuality.getEnding(await thumbnailSelector(source.stateManager))}` : 'https://mangadex.org/_nuxt/img/cover-placeholder.d12c3c5.jpg'
        const subtitle = `${mangaDetails.lastVolume ? `Vol. ${mangaDetails.lastVolume}` : ''} ${mangaDetails.lastChapter ? `Ch. ${mangaDetails.lastChapter}` : ''}`


        if (!discoveredManga.has(mangaId)) {
            results.push(
                App.createPartialSourceManga({
                    mangaId: mangaId,
                    title: title,
                    image: image,
                    subtitle: subtitle
                })
            )
            discoveredManga.add(mangaId)
        }
    }

    return results
}
