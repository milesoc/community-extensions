import { PartialSourceManga } from '@paperback/types'
import { MDImageQuality } from './MangaDexHelper'
import { MangaItem, ChapterItem, Relationship, MangaDatumAttributes } from './MangaDexInterfaces'


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

export const parseChapterListToManga = async (chapters: ChapterItem[], source: any, thumbnailSelector: any): Promise<PartialSourceManga[]> => {
    const results: PartialSourceManga[] = []
    const discoveredManga: Set<string> = new Set<string>()

    for (const chapter of chapters) {
        const mangaRelationship: Relationship = chapter.relationships.filter((x) => x.type == 'manga')[0] as Relationship

        if (mangaRelationship === undefined) {
            continue;
        }



        const mangaId = mangaRelationship.id
        
        // It may be better to adjust the data model here, as RelationshipAttributes don't apply to the manga "includes" in this
        const mangaDetails = mangaRelationship.attributes as unknown as MangaDatumAttributes
        const title = source.decodeHTMLEntity(mangaDetails.title.en ?? mangaDetails.altTitles.map(x => Object.values(x).find((v) => v !== undefined)).find((t) => t !== undefined))
        const coverFileName = '' // I don't yet have the cover file figured out
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
