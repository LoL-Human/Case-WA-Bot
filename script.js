const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')

const fs = require("fs")
const FormData = require('form-data')
const ffmpeg = require('fluent-ffmpeg')
const moment = require('moment-timezone')

const { apikey, prefix } = JSON.parse(fs.readFileSync('./config.json'))

const { fetchJson, getBuffer } = require('./lib/fetcher')
const { color } = require('./lib/color')
const { exec } = require("child_process")
const { getRandom } = require('./lib/function')
const { help, donate } = require('./help/help')
const { exit } = require('process')

async function starts() {
    const lolhuman = new WAConnection()
    lolhuman.logger.level = 'warn'
    lolhuman.on('qr', () => {
        console.log(color('[', 'red'), color('!', 'yellow'), color(']', 'red'), color(' Scan the qr code above', 'green'))
    })

    fs.existsSync('./lolhuman.json') && lolhuman.loadAuthInfo('./lolhuman.json')
    if (apikey == "") {
        ini_time = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        console.log(color(ini_time, "white"), color("[  ERROR  ]", "aqua"), color("Apikey is empty, please check at config.json", 'red'))
        exit()
    }
    lolhuman.on('connecting', () => {
        const time_connecting = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        console.log(color(time_connecting, "white"), color("[  STATS  ]", "aqua"), "Connecting...")
    })
    lolhuman.on('open', () => {
        const time_connect = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        console.log(color(time_connect, "white"), color("[  STATS  ]", "aqua"), "Connected")
    })
    await lolhuman.connect({ timeoutMs: 30 * 1000 })
    fs.writeFileSync('./lolhuman.json', JSON.stringify(lolhuman.base64EncodedAuthInfo(), null, '\t'))

    lolhuman.on('chat-update', async(lol) => {
        try {
            const time = moment.tz('Asia/Jakarta').format('HH:mm:ss')
            if (!lol.hasNewMessage) return
            lol = JSON.parse(JSON.stringify(lol)).messages[0]
            if (!lol.message) return
            if (lol.key && lol.key.remoteJid == 'status@broadcast') return
            if (lol.key.fromMe) return
            global.prefix
            const content = JSON.stringify(lol.message)
            const from = lol.key.remoteJid
            const type = Object.keys(lol.message)[0]
            const insom = from.endsWith('@g.us')
            const nameReq = insom ? lol.participant : lol.key.remoteJid
            pushname2 = lolhuman.contacts[nameReq] != undefined ? lolhuman.contacts[nameReq].vname || lolhuman.contacts[nameReq].notify : undefined

            const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType

            body = (type === 'conversation' && lol.message.conversation.startsWith(prefix)) ? lol.message.conversation : (type == 'imageMessage') && lol.message.imageMessage.caption.startsWith(prefix) ? lol.message.imageMessage.caption : (type == 'videoMessage') && lol.message.videoMessage.caption.startsWith(prefix) ? lol.message.videoMessage.caption : (type == 'extendedTextMessage') && lol.message.extendedTextMessage.text.startsWith(prefix) ? lol.message.extendedTextMessage.text : ''
            budy = (type === 'conversation') ? lol.message.conversation : (type === 'extendedTextMessage') ? lol.message.extendedTextMessage.text : ''
            var Link = (type === 'conversation' && lol.message.conversation) ? lol.message.conversation : (type == 'imageMessage') && lol.message.imageMessage.caption ? lol.message.imageMessage.caption : (type == 'videoMessage') && lol.message.videoMessage.caption ? lol.message.videoMessage.caption : (type == 'extendedTextMessage') && lol.message.extendedTextMessage.text ? lol.message.extendedTextMessage.text : ''
            const messagesLink = Link.slice(0).trim().split(/ +/).shift().toLowerCase()
            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
            const args = body.trim().split(/ +/).slice(1)
            const isCmd = body.startsWith(prefix)
            lolhuman.chatRead(from)

            const botNumber = lolhuman.user.jid
            const isGroup = from.endsWith('@g.us')
            const sender = isGroup ? lol.participant : lol.key.remoteJid
            const groupMetadata = isGroup ? await lolhuman.groupMetadata(from) : ''
            const groupName = isGroup ? groupMetadata.subject : ''
            const totalchat = await lolhuman.chats.all()

            const isUrl = (ini_url) => {
                return ini_url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
            }
            const reply = (teks) => {
                lolhuman.sendMessage(from, teks, text, { quoted: lol })
            }
            const sendMess = (hehe, teks) => {
                lolhuman.sendMessage(hehe, teks, text)
            }
            const costum = (pesan, tipe, target, target2) => {
                lolhuman.sendMessage(from, pesan, tipe, { quoted: { key: { fromMe: false, participant: `${target}`, ...(from ? { remoteJid: from } : {}) }, message: { conversation: `${target2}` } } })
            }
            const mentions = (teks, memberr, id) => {
                (id == null || id == undefined || id == false) ? lolhuman.sendMessage(from, teks.trim(), extendedText, { contextInfo: { "mentionedJid": memberr } }): lolhuman.sendMessage(from, teks.trim(), extendedText, { quoted: lol, contextInfo: { "mentionedJid": memberr } })
            }

            colors = ['red', 'white', 'black', 'blue', 'yellow', 'green', 'aqua']
            const isMedia = (type === 'imageMessage' || type === 'videoMessage')
            const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
            const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
            const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')

            if (!isGroup && !isCmd) console.log(color(time, "white"), color("[ PRIVATE ]", "aqua"), color(budy, "white"), "from", color(sender.split('@')[0], "yellow"))
            if (isGroup && !isCmd) console.log(color(time, "white"), color("[  GROUP  ]", "aqua"), color(budy, "white"), "from", color(sender.split('@')[0], "yellow"), "in", color(groupName, "yellow"))
            if (!isGroup && isCmd) console.log(color(time, "white"), color("[ COMMAND ]", "aqua"), color(budy, "white"), "from", color(sender.split('@')[0], "yellow"))
            if (isGroup && isCmd) console.log(color(time, "white"), color("[ COMMAND ]", "aqua"), color(budy, "white"), "from", color(sender.split('@')[0], "yellow"), "in", color(groupName, "yellow"))

            switch (command) {
                case 'help':
                    var punya_wa = "0@s.whatsapp.net"
                    var ini_text = "api.lolhuman.xyz"
                    var buffer = await getBuffer("https://i.ibb.co/JdfQ73m/photo-2021-02-05-10-13-39.jpg")
                    const ini_csreply = {
                        contextInfo: {
                            stanzaId: 'B826873620DD5947E683E3ABE663F263',
                            participant: punya_wa,
                            remoteJid: 'status@broadcast',
                            quotedMessage: {
                                imageMessage: {
                                    caption: ini_text,
                                    jpegThumbnail: buffer
                                }
                            }
                        }
                    }
                    lolhuman.sendMessage(from, help(prefix), text, ini_csreply)
                    break
                case 'donate':
                    reply(donate(pushname2))
                    break
                case 'broadcast':
                    list_chat = await lolhuman.chats.all()
                    ini_text = args.join(" ")
                    for (let chat of list_chat) {
                        sendMess(chat.jid, ini_text)
                    }
                    break
                case 'alquran':
                    if (args.length < 1) return reply('_Example: !alquran 108_')
                    urls = `http://api.lolhuman.xyz/api/quran/${args[0]}?apikey=${apikey}`
                    quran = await fetchJson(urls)
                    result = quran.result
                    ayat = result.ayat
                    txt = `QS. ${result.surah} : 1-${ayat.length}\n\n`
                    for (var x in ayat) {
                        test = ayat[x]
                        arab = test.arab
                        nomor = test.ayat
                        latin = test.latin
                        indo = test.indonesia
                        txt += `${arab}\n${nomor}. ${latin}\n${indo}\n\n`
                    }
                    txt = txt.replace(/<u>/g, "").replace(/<\/u>/g, "")
                    txt = txt.replace(/<strong>/g, "").replace(/<\/strong>/g, "")
                    txt = txt.replace(/<u>/g, "").replace(/<\/u>/g, "")
                    reply(txt)
                    break
                case 'alquranaudio':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} 18 or ${prefix + command} 18/10`)
                    surah = args[0]
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/quran/audio/${surah}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, buffer, audio, { quoted: lol, mimetype: Mimetype.mp4Audio })
                    break
                case 'quotes':
                    quotes = await fetchJson(`http://api.lolhuman.xyz/api/random/quotes?apikey=${apikey}`)
                    quotes = quotes.result
                    author = quotes.by
                    quotes = quotes.quote
                    reply(`_${quotes}_\n\n*― ${author}*`)
                    break
                case 'quotesdilan':
                    quotedilan = await fetchJson(`http://api.lolhuman.xyz/api/quotes/dilan?apikey=${apikey}`)
                    reply(quotedilan.result)
                    break
                case 'jadwaltv':
                    channel = args[0]
                    tvnow = await fetchJson(`http://api.lolhuman.xyz/api/jadwaltv/${channel}?apikey=${apikey}`)
                    tvnow = tvnow.result
                    txt = `Jadwal TV ${channel.toUpperCase()}\n`
                    for (var x in tvnow) {
                        txt += `${x} - ${tvnow[x]}\n`
                    }
                    reply(txt)
                    break
                case 'nhentai':
                    henid = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/nhentai/${henid}?apikey=${apikey}`)
                    get_result = get_result.result
                    txt = `Title Romaji : ${get_result.title_romaji}\n`
                    txt += `Title Native : ${get_result.title_native}\n`
                    txt += `Read Online : ${get_result.read}\n`
                    get_info = get_result.info
                    txt += `Parodies : ${get_info.parodies}\n`
                    txt += `Character : ${get_info.characters.join(", ")}\n`
                    txt += `Tags : ${get_info.tags.join(", ")}\n`
                    txt += `Artist : ${get_info.artists}\n`
                    txt += `Group : ${get_info.groups}\n`
                    txt += `Languager : ${get_info.languages.join(", ")}\n`
                    txt += `Categories : ${get_info.categories}\n`
                    txt += `Pages : ${get_info.pages}\n`
                    txt += `Uploaded : ${get_info.uploaded}\n`
                    reply(txt)
                    break
                case 'nhentaipdf':
                    henid = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/nhentaipdf/${henid}?apikey=${apikey}`)
                    get_result = get_result.result
                    buffer = await getBuffer(get_result)
                    lolhuman.sendMessage(from, buffer, document, { quoted: lol, mimetype: Mimetype.pdf, filename: `${henid}.pdf` })
                    break
                case 'wancak':
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/onecak?apikey=${apikey}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'kusonime':
                    ini_url = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/kusonime?apikey=${apikey}&url=${ini_url}`)
                    get_result = get_result.result
                    txt = `Title : ${get_result.title}\n`
                    txt += `Japanese : ${get_result.japanese}\n`
                    txt += `Genre : ${get_result.genre}\n`
                    txt += `Seasons : ${get_result.seasons}\n`
                    txt += `Producers : ${get_result.producers}\n`
                    txt += `Type : ${get_result.type}\n`
                    txt += `Status : ${get_result.status}\n`
                    txt += `Total Episode : ${get_result.total_episode}\n`
                    txt += `Score : ${get_result.score}\n`
                    txt += `Duration : ${get_result.duration}\n`
                    txt += `Released On : ${get_result.released_on}\n`
                    txt += `Desc : ${get_result.desc}\n`
                    link_dl = get_result.link_dl
                    for (var x in link_dl) {
                        txt += `\n${x}\n`
                        for (var y in link_dl[x]) {
                            txt += `${y} - ${link_dl[x][y]}\n`
                        }
                    }
                    buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol, caption: txt })
                    break
                case 'kusonimesearch':
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/kusonimesearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    txt = `Title : ${get_result.title}\n`
                    txt += `Japanese : ${get_result.japanese}\n`
                    txt += `Genre : ${get_result.genre}\n`
                    txt += `Seasons : ${get_result.seasons}\n`
                    txt += `Producers : ${get_result.producers}\n`
                    txt += `Type : ${get_result.type}\n`
                    txt += `Status : ${get_result.status}\n`
                    txt += `Total Episode : ${get_result.total_episode}\n`
                    txt += `Score : ${get_result.score}\n`
                    txt += `Duration : ${get_result.duration}\n`
                    txt += `Released On : ${get_result.released_on}\n`
                    txt += `Desc : ${get_result.desc}\n`
                    link_dl = get_result.link_dl
                    for (var x in link_dl) {
                        txt += `\n${x}\n`
                        for (var y in link_dl[x]) {
                            txt += `${y} - ${link_dl[x][y]}\n`
                        }
                    }
                    buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol, caption: txt })
                    break
                case 'otakudesu':
                    ini_url = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/otakudesu?apikey=${apikey}&url=${ini_url}`)
                    get_result = get_result.result
                    txt = `Title : ${get_result.title}\n`
                    txt += `Japanese : ${get_result.japanese}\n`
                    txt += `Judul : ${get_result.judul}\n`
                    txt += `Type : ${get_result.type}\n`
                    txt += `Episode : ${get_result.episodes}\n`
                    txt += `Aired : ${get_result.aired}\n`
                    txt += `Producers : ${get_result.producers}\n`
                    txt += `Genre : ${get_result.genres}\n`
                    txt += `Duration : ${get_result.duration}\n`
                    txt += `Studios : ${get_result.status}\n`
                    txt += `Rating : ${get_result.rating}\n`
                    txt += `Credit : ${get_result.credit}\n`
                    get_link = get_result.link_dl
                    for (var x in get_link) {
                        txt += `\n\n*${get_link[x].title}*\n`
                        for (var y in get_link[x].link_dl) {
                            info = get_link[x].link_dl[y]
                            txt += `\n\`\`\`Reso : \`\`\`${info.reso}\n`
                            txt += `\`\`\`Size : \`\`\`${info.size}\n`
                            txt += `\`\`\`Link : \`\`\`\n`
                            down_link = info.link_dl
                            for (var z in down_link) {
                                txt += `${z} - ${down_link[z]}\n`
                            }
                        }
                    }
                    reply(txt)
                    break
                case 'otakudesusearch':
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/otakudesusearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    txt = `Title : ${get_result.title}\n`
                    txt += `Japanese : ${get_result.japanese}\n`
                    txt += `Judul : ${get_result.judul}\n`
                    txt += `Type : ${get_result.type}\n`
                    txt += `Episode : ${get_result.episodes}\n`
                    txt += `Aired : ${get_result.aired}\n`
                    txt += `Producers : ${get_result.producers}\n`
                    txt += `Genre : ${get_result.genres}\n`
                    txt += `Duration : ${get_result.duration}\n`
                    txt += `Studios : ${get_result.status}\n`
                    txt += `Rating : ${get_result.rating}\n`
                    txt += `Credit : ${get_result.credit}\n`
                    get_link = get_result.link_dl
                    for (var x in get_link) {
                        txt += `\n\n*${get_link[x].title}*\n`
                        for (var y in get_link[x].link_dl) {
                            info = get_link[x].link_dl[y]
                            txt += `\n\`\`\`Reso : \`\`\`${info.reso}\n`
                            txt += `\`\`\`Size : \`\`\`${info.size}\n`
                            txt += `\`\`\`Link : \`\`\`\n`
                            down_link = info.link_dl
                            for (var z in down_link) {
                                txt += `${z} - ${down_link[z]}\n`
                            }
                        }
                    }
                    reply(txt)
                    break
                case 'sticker':
                    if ((isMedia && !lol.message.videoMessage || isQuotedImage) && args.length == 0) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        const media = await lolhuman.downloadAndSaveMediaMessage(encmedia)
                        const ran = getRandom('.webp')
                        await ffmpeg(`./${media}`)
                            .input(media)
                            .on('start', function(cmd) {
                                console.log(`Started : ${cmd}`)
                            })
                            .on('error', function(err) {
                                console.log(`Error : ${err}`)
                                fs.unlinkSync(media)
                                reply(mess.error.stick)
                            })
                            .on('end', function() {
                                console.log('Finish')
                                buff = fs.readFileSync(ran)
                                lolhuman.sendMessage(from, buff, sticker, { quoted: lol })
                                fs.unlinkSync(media)
                                fs.unlinkSync(ran)
                            })
                            .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                            .toFormat('webp')
                            .save(ran)
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix}sticker atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'telesticker':
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/telestick?apikey=${apikey}&url=${ini_url}`)
                    ini_sticker = ini_url.result.sticker
                    for (sticker_ in ini_sticker) {
                        buffer = await getBuffer(ini_sticker[sticker_])
                        lolhuman.sendMessage(from, buffer, sticker)
                    }
                    break
                case 'igdl':
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/instagram?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result
                    ini_type = image
                    if (ini_url.includes(".mp4")) ini_type = video
                    buffer = await getBuffer(ini_url)
                    lolhuman.sendMessage(from, buffer, ini_type, { quoted: lol })
                    break
                case 'fbdl':
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/facebook?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result[0].link
                    buffer = await getBuffer(ini_url)
                    lolhuman.sendMessage(from, buffer, video, { quoted: lol })
                    break
                case 'ytplay':
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytplay?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    get_info = get_result.info
                    txt = `Title : ${get_info.title}\n`
                    txt += `Uploader : ${get_info.uploader}\n`
                    txt += `Duration : ${get_info.duration}\n`
                    txt += `View : ${get_info.view}\n`
                    txt += `Like : ${get_info.like}\n`
                    txt += `Dislike : ${get_info.dislike}\n`
                    txt += `Description :\n ${get_info.description}\n`
                    buffer = await getBuffer(get_info.thumbnail)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol, caption: txt })
                    get_audio = await getBuffer(get_result.audio[3].link)
                    lolhuman.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${get_info.title}.mp3`, quoted: lol })
                    get_video = await getBuffer(get_result.video[0].link)
                    lolhuman.sendMessage(from, get_audio, video, { mimetype: 'video/mp4', filename: `${get_info.title}.mp4`, quoted: lol })
                    break
                case 'ytmp3':
                    ini_link = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytaudio?apikey=${apikey}&url=${ini_link}`)
                    get_result = get_result.result
                    txt = `Title : ${get_result.title}\n`
                    txt += `Uploader : ${get_result.uploader}\n`
                    txt += `Duration : ${get_result.duration}\n`
                    txt += `View : ${get_result.view}\n`
                    txt += `Like : ${get_result.like}\n`
                    txt += `Dislike : ${get_result.dislike}\n`
                    txt += `Description :\n ${get_result.description}`
                    buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol, caption: txt })
                    get_audio = await getBuffer(get_result.link[3].link)
                    lolhuman.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${get_result.title}.mp3`, quoted: lol })
                    break
                case 'ytmp4':
                    ini_link = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytvideo?apikey=${apikey}&url=${ini_link}`)
                    get_result = get_result.result
                    txt = `Title : ${get_result.title}\n`
                    txt += `Uploader : ${get_result.uploader}\n`
                    txt += `Duration : ${get_result.duration}\n`
                    txt += `View : ${get_result.view}\n`
                    txt += `Like : ${get_result.like}\n`
                    txt += `Dislike : ${get_result.dislike}\n`
                    txt += `Description :\n ${get_result.description}`
                    buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol, caption: txt })
                    get_audio = await getBuffer(get_result.link[0].link)
                    lolhuman.sendMessage(from, get_audio, video, { mimetype: 'video/mp4', filename: `${get_result.title}.mp4`, quoted: lol })
                    break
                case 'pinterest':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/pinterest?apikey=${apikey}&query=${query}`)
                    ini_url = ini_url.result
                    buffer = await getBuffer(ini_url)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'pinterestdl':
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://lolhuman.herokuapp.com/api/pinterestdl?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result["736x"]
                    buffer = await getBuffer(ini_url)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'pixiv':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/pixiv?apikey=${apikey}&query=${query}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'pixivdl':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} pixiv_id\nExample: ${prefix + command} 63456028`)
                    query = args[0]
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/pixivdl/${pixivid}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'konachan':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} azur_lane`)
                    query = args.join(" ")
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/konachan?apikey=${apikey}&query=${query}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'ttp':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} LoL Human`)
                    txt = args.join(" ")
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/ttp?apikey=${apikey}&text=${txt}`)
                    lolhuman.sendMessage(from, buffer, sticker, { quoted: lol })
                    break
                case 'wait':
                    if ((isMedia && !lol.message.videoMessage || isQuotedImage) && args.length == 0) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        const filePath = await lolhuman.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        const form = new FormData();
                        const stats = fs.statSync(filePath);
                        const fileSizeInBytes = stats.size;
                        const fileStream = fs.createReadStream(filePath);
                        form.append('img', fileStream, { knownLength: fileSizeInBytes });
                        const options = {
                            method: 'POST',
                            credentials: 'include',
                            body: form
                        }
                        get_result = await fetchJson(`http://api.lolhuman.xyz/api/wait?apikey=${apikey}`, {...options })
                        fs.unlinkSync(filePath)
                        get_result = get_result.result
                        ini_video = await getBuffer(get_result.video)
                        txt = `Anilist id : ${get_result.anilist_id}\n`
                        txt += `MAL id : ${get_result.mal_id}\n`
                        txt += `Title Romaji : ${get_result.title_romaji}\n`
                        txt += `Title Native : ${get_result.title_native}\n`
                        txt += `Title English : ${get_result.title_english}\n`
                        txt += `at : ${get_result.at}\n`
                        txt += `Episode : ${get_result.episode}\n`
                        txt += `Eimilarity : ${get_result.similarity}`
                        lolhuman.sendMessage(from, ini_video, video, { quoted: lol, caption: txt })
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'xnxxsearch':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} Japanese`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/xnxxsearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    txt = ""
                    for (var x in get_result) {
                        txt += `Title : ${get_result[x].title}\n`
                        txt += `Views : ${get_result[x].views}\n`
                        txt += `Duration : ${get_result[x].duration}\n`
                        txt += `Uploader : ${get_result[x].uploader}\n`
                        txt += `Link : ${get_result[x].link}\n`
                        txt += `Thumbnail : ${get_result[x].thumbnail}\n\n`
                    }
                    reply(txt)
                    break
                case 'xnxx':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} Japanese`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/xnxx?apikey=${apikey}&url=${query}`)
                    get_result = get_result.result
                    txt = `Title : ${get_result.title}\n`
                    txt += `Duration : ${get_result.duration}\n`
                    txt += `View : ${get_result.title}\n`
                    txt += `Rating : ${get_result.rating}\n`
                    txt += `Like : ${get_result.like}\n`
                    txt += `Dislike : ${get_result.dislike}\n`
                    txt += `Comment : ${get_result.comment}\n`
                    txt += `Tag : ${get_result.tag.join(", ")}\n`
                    txt += `Description : ${get_result.description}\n`
                    txt += "Link : \n"
                    link = get_result.link
                    for (var x in link) {
                        txt += `${link[x].type} - ${link[x].link}\n\n`
                    }
                    thumbnail = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: txt })
                    break
                case 'lk21':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} Transformer`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/lk21?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    txt = `Title : ${get_result.title}\n`
                    txt += `Link : ${get_result.link}\n`
                    txt += `Genre : ${get_result.genre}\n`
                    txt += `Views : ${get_result.views}\n`
                    txt += `Duration : ${get_result.duration}\n`
                    txt += `Tahun : ${get_result.tahun}\n`
                    txt += `Rating : ${get_result.rating}\n`
                    txt += `Desc : ${get_result.desc}\n`
                    txt += `Actors : ${get_result.actors.join(", ")}\n`
                    txt += `Location : ${get_result.location}\n`
                    txt += `Date Release : ${get_result.date_release}\n`
                    txt += `Language : ${get_result.language}\n`
                    txt += `Link Download : ${get_result.link_dl}`
                    thumbnail = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: txt })
                    break
                case 'drakorongoing':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/drakorongoing?apikey=${apikey}`)
                    get_result = get_result.result
                    txt = "Ongoing Drakor\n\n"
                    for (var x in get_result) {
                        txt += `Title : ${get_result[x].title}\n`
                        txt += `Category : ${get_result[x].category}\n`
                        txt += `Link : ${get_result[x].link}\n`
                        txt += `Thumbnail : ${get_result[x].thumbnail}\n`
                        txt += `Year : ${get_result[x].category}\n`
                        txt += `Total_episode : ${get_result[x].total_episode}\n`
                        txt += `Genre : ${get_result[x].genre.join(", ")}\n\n`
                    }
                    reply(txt)
                    break
                case 'triggered':
                    ini_url = args[0]
                    ranp = getRandom('.gif')
                    rano = getRandom('.webp')
                    buffer = `http://api.lolhuman.xyz/api/editor/triggered?apikey=${apikey}&img=${ini_url}`
                    exec(`wget "${buffer}" -O ${ranp} && ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rano}`, (err) => {
                        fs.unlinkSync(ranp)
                        buff = fs.readFileSync(rano)
                        lolhuman.sendMessage(from, buff, sticker, { quoted: lol })
                        fs.unlinkSync(rano)
                    })
                    break
                case 'wasted':
                case 'photoeditor':
                    ini_url = args[0]
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/editor/${wasted}?apikey=${apikey}&img=${ini_url}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'tiktoknowm':
                    ini_url = args[0]
                    ini_url = `http://api.lolhuman.xyz/api/tiktok?apikey=${apikey}&url=${ini_url}`
                    get_result = await fetchJson(ini_url)
                    buffer = await getBuffer(get_result.result.link)
                    lolhuman.sendMessage(from, buffer, video, { quoted: lol })
                    break
                case 'nsfwcheck':
                    if ((isMedia && !lol.message.videoMessage || isQuotedImage) && args.length == 0) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        const filePath = await lolhuman.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        const form = new FormData();
                        const stats = fs.statSync(filePath);
                        const fileSizeInBytes = stats.size;
                        const fileStream = fs.createReadStream(filePath);
                        form.append('img', fileStream, { knownLength: fileSizeInBytes });
                        const options = {
                            method: 'POST',
                            credentials: 'include',
                            body: form
                        }
                        get_result = await fetchJson(`http://api.lolhuman.xyz/api/nsfwcheck?apikey=${apikey}`, {...options })
                        fs.unlinkSync(filePath)
                        get_result = get_result.result
                        is_nsfw = "No"
                        if (Number(get_result.replace("%", "")) >= 50) is_nsfw = "Yes"
                        reply(`Is NSFW? ${is_nsfw}\nNSFW Score : ${get_result}`)
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'semoji':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} 😭`)
                    emoji = args[0]
                    try {
                        emoji = encodeURI(emoji[0])
                    } catch {
                        emoji = encodeURI(emoji)
                    }
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/smoji/${emoji}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, buffer, sticker, { quoted: lol })
                    break
                case 'fakedonald':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} LoL Human`)
                    txt = args.join(" ")
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/tweettrump?apikey=${apikey}&text=${txt}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'spamsms':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} query\nExample: ${prefix + command} 08303030303030`)
                    nomor = args[0]
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam1?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam2?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam3?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam4?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam5?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam6?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam7?apikey=${apikey}&nomor=${nomor}`)
                    await fetchJson(`http://api.lolhuman.xyz/api/sms/spam8?apikey=${apikey}&nomor=${nomor}`)
                    reply("Success")
                    break
                case 'faketoko':
                    var punya_wa = "0@s.whatsapp.net"
                    var buffer = await getBuffer("https://i.ibb.co/JdfQ73m/photo-2021-02-05-10-13-39.jpg")
                    const ini_cstoko = {
                        contextInfo: {
                            participant: punya_wa,
                            remoteJid: 'status@broadcast',
                            quotedMessage: {
                                productMessage: {
                                    product: {
                                        currencyCode: "IDR",
                                        title: "LoL Human",
                                        priceAmount1000: 10000000,
                                        productImageCount: 1,
                                        productImage: {
                                            jpegThumbnail: buffer
                                        }
                                    },
                                    businessOwnerJid: "0@s.whatsapp.net"
                                }
                            }
                        }
                    }
                    lolhuman.sendMessage(from, "LoL Human REST APIs", text, ini_cstoko)
                    break

                    // Random Image //
                case 'art':
                case 'bts':
                case 'exo':
                case 'elf':
                case 'loli':
                case 'neko':
                case 'waifu':
                case 'shota':
                case 'husbu':
                case 'sagiri':
                case 'shinobu':
                case 'megumin':
                case 'wallnime':
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/random/${command}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'chiisaihentai':
                case 'trap':
                case 'blowjob':
                case 'yaoi':
                case 'ecchi':
                case 'hentai':
                case 'ahegao':
                case 'hololewd':
                case 'sideoppai':
                case 'animefeets':
                case 'animebooty':
                case 'animethighss':
                case 'hentaiparadise':
                case 'animearmpits':
                case 'hentaifemdom':
                case 'lewdanimegirls':
                case 'biganimetiddies':
                case 'animebellybutton':
                case 'hentai4everyone':
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/random/nsfw/${command}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'bj':
                case 'ero':
                case 'cum':
                case 'feet':
                case 'yuri':
                case 'trap':
                case 'lewd':
                case 'feed':
                case 'eron':
                case 'solo':
                case 'gasm':
                case 'poke':
                case 'anal':
                case 'holo':
                case 'tits':
                case 'kuni':
                case 'kiss':
                case 'erok':
                case 'smug':
                case 'baka':
                case 'solog':
                case 'feetg':
                case 'lewdk':
                case 'waifu':
                case 'pussy':
                case 'femdom':
                case 'cuddle':
                case 'hentai':
                case 'eroyuri':
                case 'cum_jpg':
                case 'blowjob':
                case 'erofeet':
                case 'holoero':
                case 'classic':
                case 'erokemo':
                case 'fox_girl':
                case 'futanari':
                case 'lewdkemo':
                case 'wallpaper':
                case 'pussy_jpg':
                case 'kemonomimi':
                case 'nsfw_avatar':
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/random2/${command}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                case 'ngif':
                case 'nsfw_neko_gif':
                case 'random_hentai_gif':
                    ranp = getRandom('.gif')
                    rano = getRandom('.webp')
                    buffer = `http://api.lolhuman.xyz/api/random2/${command}?apikey=${apikey}`
                    exec(`wget ${buffer} -O ${ranp} && ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rano}`, (err) => {
                        fs.unlinkSync(ranp)
                        buff = fs.readFileSync(rano)
                        lolhuman.sendMessage(from, buff, sticker, { quoted: lol })
                        fs.unlinkSync(rano)
                    })
                    break

                    // Textprome //
                case 'blackpink':
                case 'neon':
                case 'greenneon':
                case 'advanceglow':
                case 'futureneon':
                case 'sandwriting':
                case 'sandsummer':
                case 'sandengraved':
                case 'metaldark':
                case 'neonlight':
                case 'holographic':
                case 'text1917':
                case 'minion':
                case 'deluxesilver':
                case 'newyearcard':
                case 'bloodfrosted':
                case 'halloween':
                case 'jokerlogo':
                case 'fireworksparkle':
                case 'natureleaves':
                case 'bokeh':
                case 'toxic':
                case 'strawberry':
                case 'box3d':
                case 'roadwarning':
                case 'breakwall':
                case 'icecold':
                case 'luxury':
                case 'cloud':
                case 'summersand':
                case 'horrorblood':
                case 'thunder':
                case 'christmas':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} text\nExample: ${prefix + command} LoL Human`)
                    txt = args.join(" ")
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/textprome/${command}?apikey=${apikey}&text=${txt}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break

                    // Photo Oxy //
                case 'shadow':
                case 'cup':
                case 'cup1':
                case 'romance':
                case 'smoke':
                case 'burnpaper':
                case 'lovemessage':
                case 'undergrass':
                case 'love':
                case 'coffe':
                case 'woodheart':
                case 'woodenboard':
                case 'summer3d':
                case 'wolfmetal':
                case 'nature3d':
                case 'underwater':
                case 'golderrose':
                case 'summernature':
                case 'letterleaves':
                case 'glowingneon':
                case 'fallleaves':
                case 'flamming':
                case 'harrypotter':
                case 'carvedwood':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} text\nExample: ${prefix + command} LoL Human`)
                    txt = args.join(" ")
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/photooxy1/${command}?apikey=${apikey}&text=${txt}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break

                    // Ephoto 360 //
                case 'wetglass':
                case 'multicolor3d':
                case 'watercolor':
                case 'luxurygold':
                case 'galaxywallpaper':
                case 'lighttext':
                case 'beautifulflower':
                case 'puppycute':
                case 'royaltext':
                case 'heartshaped':
                case 'birthdaycake':
                case 'galaxystyle':
                case 'hologram3d':
                case 'greenneon':
                case 'glossychrome':
                case 'greenbush':
                case 'metallogo':
                case 'noeltext':
                case 'glittergold':
                case 'textcake':
                case 'starsnight':
                case 'wooden3d':
                case 'textbyname':
                case 'writegalacy':
                case 'galaxybat':
                case 'snow3d':
                case 'birthdayday':
                case 'goldplaybutton':
                case 'silverplaybutton':
                case 'freefire':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} text\nExample: ${prefix + command} LoL Human`)
                    txt = args.join(" ")
                    buffer = await getBuffer(`http://api.lolhuman.xyz/api/ephoto1/${command}?apikey=${apikey}&text=${txt}`)
                    lolhuman.sendMessage(from, buffer, image, { quoted: lol })
                    break
                default:
                    if (isCmd) {
                        reply(`Sorry bro, command *${prefix}${command}* gk ada di list *${prefix}help*`)
                    }
                    if (!isGroup && !isCmd) {
                        simi = await fetchJson(`http://api.lolhuman.xyz/api/simi?apikey=${apikey}&text=${budy}`)
                        reply(simi.result)
                    }
            }
        } catch (e) {
            if (!e.includes("this.isZero")) {
                const time_error = moment.tz('Asia/Jakarta').format('HH:mm:ss')
                console.log(color(time_error, "white"), color("[  ERROR  ]", "aqua"), color(e, 'red'), color("in", "red"), color(e.line, "red"))
            }
        }
    })
}
starts()