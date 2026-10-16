// Generic case handler for the endpoints listed in lib/lolhuman-features.js.
// It builds the request from the feature's inputs, then decides how to reply from the
// response itself: media (image/video/audio/webp/gif) is sent as media, JSON is formatted as text.
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')
const ffmpeg = require('fluent-ffmpeg')
const features = require('./lolhuman-features')
const { getRandom } = require('./function')

const BASE = 'https://api.lolhuman.xyz'
const featureMap = new Map(features.map(f => [f.cmd, f]))
const isUrl = s => /^https?:\/\/\S+$/i.test(s)
const MEDIA_EXT = /\.(jpe?g|png|gif|webp|mp4|mp3|m4a|ogg|opus|wav|pdf)(\?|$)/i
const IMAGE_KEY = /^(image|img|thumbnail|thumb|photo|picture|cover|poster|avatar|icon|logo)$/i
const VIDEO_KEY = /^(video|video_url|nowm|no_watermark|mp4)$/i
const AUDIO_KEY = /^(audio|audio_url|music|mp3)$/i
const ANSWER_KEY = /^(jawaban|answer|deskripsi|description|penjelasan)$/i
const MAX_TEXT = 6000

const getFeature = cmd => featureMap.get(cmd)

const textInputs = f => (f.inputs || []).filter(i => i.kind === 'text')
const mediaInputs = f => (f.inputs || []).filter(i => i.kind === 'image' || i.kind === 'file')

function usage(f, prefix) {
    const texts = textInputs(f)
    let out = `${prefix}${f.cmd}`
    if (texts.length) out += ' ' + texts.map(i => i.name).join('|')
    if (mediaInputs(f).length) out += f.post ? ' (kirim/reply gambar)' : ' (url gambar)'
    return out
}

function example(f, prefix) {
    const texts = textInputs(f)
    let out = `${prefix}${f.cmd}`
    if (texts.length) out += ' ' + texts.map(i => i.example).join('|')
    return out
}

// Image/file sent with the command, or in the message being replied to.
function findMedia(lol, types) {
    const own = lol.message || {}
    const withContext = Object.values(own).find(v => v && v.contextInfo && v.contextInfo.quotedMessage)
    const quoted = withContext && withContext.contextInfo.quotedMessage
    for (const msg of [own, quoted]) {
        if (!msg) continue
        const type = types.find(t => msg[t])
        if (type) return { message: { [type]: msg[type] }, mimetype: msg[type].mimetype || '' }
    }
    return null
}

function fileName(name, mimetype) {
    const ext = (mimetype || 'image/jpeg').split('/')[1].split(';')[0]
    return `${name}.${ext}`
}

async function fetchBuffer(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000, headers: { 'user-agent': 'Mozilla/5.0' } })
    return { buffer: Buffer.from(res.data), mimetype: String(res.headers['content-type'] || '').split(';')[0] }
}

function gifToMp4(buffer) {
    const input = getRandom('.gif')
    const output = getRandom('.mp4')
    fs.writeFileSync(input, buffer)
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .outputOptions(['-movflags faststart', '-pix_fmt yuv420p', '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2'])
            .save(output)
            .on('end', () => resolve(fs.readFileSync(output)))
            .on('error', reject)
    }).finally(() => {
        for (const file of [input, output]) if (fs.existsSync(file)) fs.unlinkSync(file)
    })
}

async function sendBuffer(ctx, buffer, mimetype, caption) {
    const { conn, from, lol, MessageType, Mimetype } = ctx
    const opts = { quoted: lol }
    if (mimetype === 'image/webp') return conn.sendMessage(from, buffer, MessageType.sticker, opts)
    if (mimetype === 'image/gif') {
        const video = await gifToMp4(buffer).catch(() => null)
        if (video) return conn.sendMessage(from, video, MessageType.video, { ...opts, mimetype: Mimetype.gif, caption })
        return conn.sendMessage(from, buffer, MessageType.document, { ...opts, mimetype, filename: 'result.gif' })
    }
    if (mimetype.startsWith('image/')) return conn.sendMessage(from, buffer, MessageType.image, { ...opts, caption })
    if (mimetype.startsWith('video/')) return conn.sendMessage(from, buffer, MessageType.video, { ...opts, caption })
    if (mimetype.startsWith('audio/')) return conn.sendMessage(from, buffer, MessageType.audio, { ...opts, mimetype: Mimetype.mp4Audio })
    return conn.sendMessage(from, buffer, MessageType.document, { ...opts, mimetype: mimetype || 'application/octet-stream', filename: fileName('result', mimetype || 'application/bin') })
}

// Sends the URL as media when it points to media, otherwise returns false.
async function sendUrl(ctx, url, caption) {
    const media = await fetchBuffer(url).catch(() => null)
    if (!media || !/^(image|video|audio)\/|^application\/pdf$/.test(media.mimetype)) return false
    await sendBuffer(ctx, media.buffer, media.mimetype, caption)
    return true
}

const title = key => String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

function format(value, indent = '') {
    if (Array.isArray(value)) {
        const objects = value.some(x => x && typeof x === 'object')
        return value.map(x => (x && typeof x === 'object' ? format(x, indent) : `${indent}• ${x}`)).join(objects ? '\n\n' : '\n')
    }
    if (value && typeof value === 'object') {
        return Object.entries(value)
            .filter(([, x]) => x !== null && x !== undefined && x !== '')
            .map(([k, x]) => (x && typeof x === 'object' ? `${indent}*${title(k)}* :\n${format(x, indent + '  ')}` : `${indent}*${title(k)}* : ${x}`))
            .join('\n')
    }
    return indent + String(value)
}

const truncate = text => (text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) + '\n...' : text)

function pickUrl(obj, keyPattern) {
    for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && isUrl(v) && keyPattern.test(k)) return v
    }
    return null
}

async function sendJson(ctx, result, f) {
    const { reply } = ctx
    if (typeof result === 'string') {
        if (isUrl(result) && (await sendUrl(ctx, result))) return
        return reply(truncate(result))
    }
    if (Array.isArray(result)) {
        if (result.length && result.every(x => typeof x === 'string' && isUrl(x) && MEDIA_EXT.test(x))) {
            for (const url of result.slice(0, 5)) await sendUrl(ctx, url)
            return
        }
        return reply(truncate(format(result.slice(0, 15))))
    }
    if (!result || typeof result !== 'object') return reply(String(result))

    if (f.game) return sendGame(ctx, result)

    const image = pickUrl(result, IMAGE_KEY)
    const video = pickUrl(result, VIDEO_KEY)
    const audio = pickUrl(result, AUDIO_KEY)
    const caption = truncate(format(Object.fromEntries(Object.entries(result).filter(([, v]) => v !== image))))
    if (!(image && (await sendUrl(ctx, image, caption)))) await reply(truncate(format(result)))
    if (video) await sendUrl(ctx, video)
    if (audio) await sendUrl(ctx, audio)
}

// Quiz endpoints return the answer together with the question: hide it and reveal it later.
async function sendGame(ctx, result) {
    const { reply } = ctx
    const answer = {}
    const question = {}
    for (const [k, v] of Object.entries(result)) (ANSWER_KEY.test(k) ? answer : question)[k] = v
    const image = pickUrl(question, IMAGE_KEY)
    const text = format(Object.fromEntries(Object.entries(question).filter(([, v]) => v !== image))) + '\n\nJawaban akan dikirim dalam 60 detik.'
    if (!(image && (await sendUrl(ctx, image, text)))) await reply(text)
    if (Object.keys(answer).length) setTimeout(() => reply(format(answer)), 60 * 1000)
}

async function runFeature(f, ctx) {
    const { conn, lol, sender, args, prefix, apikey, isOwner, mentionUser, reply } = ctx
    if (f.ownerOnly && !isOwner) return reply('Command only for owner bot')

    const inputs = f.inputs || []
    const needsMedia = mediaInputs(f).length > 0
    const urlArgs = needsMedia ? args.filter(isUrl) : []
    const rest = needsMedia ? args.filter(a => !isUrl(a)) : args
    const texts = textInputs(f)
    const raw = rest.join(' ').trim()
    const values = texts.length === 1 ? [raw] : raw.split('|').map(s => s.trim())
    if (texts.length && (values.length < texts.length || values.slice(0, texts.length).some(v => !v))) {
        return reply(`Format: ${usage(f, prefix)}\nExample: ${example(f, prefix)}`)
    }

    // Media sources in priority order: attached/quoted media (POST only), URLs in args, profile pictures.
    const sources = []
    if (needsMedia && f.post) {
        const wantsFile = inputs.some(i => i.kind === 'file')
        const media = findMedia(lol, wantsFile ? ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'] : ['imageMessage', 'stickerMessage'])
        if (media) sources.push({ media })
    }
    urlArgs.forEach(url => sources.push({ url }))
    if (needsMedia && !inputs.some(i => i.kind === 'file')) {
        for (const jid of [...mentionUser, sender]) {
            const url = await conn.getProfilePicture(jid).catch(() => null)
            if (url) sources.push({ url })
        }
    }

    let path = f.path
    const params = { apikey }
    const files = []
    let t = 0
    for (const input of inputs) {
        let value
        if (input.kind === 'text') value = values[t++]
        else if (input.kind === 'fixed') value = input.example
        else if (input.kind === 'sender') value = sender.split('@')[0]
        else {
            const source = sources.shift()
            if (!source) return reply(`Kirim atau reply gambar/file, atau sertakan url-nya.\nFormat: ${usage(f, prefix)}`)
            if (f.post) {
                const media = source.media
                    ? { buffer: await conn.downloadMediaMessage(source.media), mimetype: source.media.mimetype }
                    : await fetchBuffer(source.url)
                files.push({ name: input.name, ...media })
                continue
            }
            value = source.url
        }
        if (input.loc === 'path') path = path.replace(`{${input.name}}`, encodeURIComponent(value))
        else params[input.name] = value
    }

    let res
    if (files.length) {
        const form = new FormData()
        for (const file of files) form.append(file.name, file.buffer, { filename: fileName(file.name, file.mimetype), contentType: file.mimetype || 'application/octet-stream' })
        for (const [k, v] of Object.entries(params)) if (k !== 'apikey') form.append(k, v)
        res = await axios.post(BASE + path, form, { params, headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 120000, maxBodyLength: Infinity, validateStatus: () => true })
    } else {
        res = await axios.get(BASE + path, { params, responseType: 'arraybuffer', timeout: 120000, validateStatus: () => true })
    }

    const mimetype = String(res.headers['content-type'] || '').split(';')[0]
    const buffer = Buffer.from(res.data)
    if (!/json|^text\//.test(mimetype)) {
        if (res.status !== 200) return reply(`Gagal (HTTP ${res.status}).`)
        return sendBuffer(ctx, buffer, mimetype)
    }
    let body
    try {
        body = JSON.parse(buffer.toString())
    } catch (e) {
        return reply(truncate(buffer.toString()))
    }
    if (body.status != 200) return reply(`Gagal: ${typeof body.message === 'string' ? body.message : 'terjadi kesalahan'}`)
    return sendJson(ctx, body.result, f)
}

// Menu entries grouped by help.js section title.
function menuSections(prefix) {
    const sections = new Map()
    for (const f of features) {
        if (!sections.has(f.cat)) sections.set(f.cat, [])
        sections.get(f.cat).push(`├ • ${usage(f, prefix)}${f.premium ? ' (premium)' : ''}`)
    }
    return sections
}

module.exports = { getFeature, runFeature, menuSections }
