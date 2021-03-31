const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')

const fs = require("fs")
const FormData = require('form-data')
const request = require('request')
const moment = require('moment-timezone')

const { apikey, prefix, owner } = JSON.parse(fs.readFileSync('./config.json'))

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
        const time_connecting = moment.tz('Asia/Jakarta').format('HH:mm:ss')
        console.log(color(time_connecting, "white"), color("[  STATS  ]", "aqua"), "Scan QR Code with WhatsApp")
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

    lolhuman.on('group-participants-update', async(chat) => {
        try {
            mem = chat.participants[0]
            try {
                var pp_user = await lolhuman.getProfilePicture(mem)
            } catch (e) {
                var pp_user = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
            }
            if (chat.action == 'add') {
                ini_user = lolhuman.contacts[mem]
                ini_img = await getBuffer(`http://api.lolhuman.xyz/api/welcomeimage?apikey=${apikey}&img=${pp_user}&text=${ini_user.notify}`)
                group_info = await lolhuman.groupMetadata(chat.jid)
                welkam = `${ini_user.notify}, Welkam to ${group_info.subject}`
                lolhuman.sendMessage(chat.jid, ini_img, MessageType.image, { caption: welkam })
            }
            if (chat.action == 'remove') {
                ini_user = lolhuman.contacts[mem]
                ini_out = `${ini_user.notify}, Sayonara 👋`
                lolhuman.sendMessage(chat.jid, ini_out, MessageType.text)
            }
        } catch (e) {
            console.log('Error :', e)
        }
    })

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
            async function faketoko(teks, url_image, title, code, price) {
                var punya_wa = "0@s.whatsapp.net"
                var ini_buffer = await getBuffer(url_image)
                const ini_cstoko = {
                    contextInfo: {
                        participant: punya_wa,
                        remoteJid: 'status@broadcast',
                        quotedMessage: {
                            productMessage: {
                                product: {
                                    currencyCode: code,
                                    title: title,
                                    priceAmount1000: price,
                                    productImageCount: 1,
                                    productImage: {
                                        jpegThumbnail: ini_buffer
                                    }
                                },
                                businessOwnerJid: "0@s.whatsapp.net"
                            }
                        }
                    }
                }
                lolhuman.sendMessage(from, teks, text, ini_cstoko)
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
                    var ini_buffer = await getBuffer("https://i.ibb.co/JdfQ73m/photo-2021-02-05-10-13-39.jpg")
                    const ini_csreply = {
                        contextInfo: {
                            stanzaId: 'B826873620DD5947E683E3ABE663F263',
                            participant: punya_wa,
                            remoteJid: 'status@broadcast',
                            quotedMessage: {
                                imageMessage: {
                                    caption: ini_text,
                                    jpegThumbnail: ini_buffer
                                }
                            }
                        }
                    }
                    lolhuman.sendMessage(from, help(prefix), text, ini_csreply)
                    break
                case 'donate':
                    reply(donate(pushname2))
                    break
                case 'hidetag':
                    if (sender.split("@")[0] != owner) return reply("Command only for owner bot")
                    var value = args.join(" ")
                    var group = await lolhuman.groupMetadata(from)
                    var member = group['participants']
                    var mem = []
                    member.map(async adm => {
                        mem.push(adm.id.replace('c.us', 's.whatsapp.net'))
                    })
                    var options = {
                        text: value,
                        contextInfo: { mentionedJid: mem },
                        quoted: lol
                    }
                    lolhuman.sendMessage(from, options, text)
                    break
                case 'broadcast':
                    if (sender.split("@")[0] != owner) return reply("Command only for owner bot")
                    list_chat = await lolhuman.chats.all()
                    ini_text = args.join(" ")
                    for (let chat of list_chat) {
                        sendMess(chat.jid, ini_text)
                    }
                    break

                    // Islami //
                case 'listsurah':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/quran?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = 'List Surah:\n'
                    for (var x in get_result) {
                        ini_txt += `${x}. ${get_result[x]}\n`
                    }
                    reply(ini_txt)
                    break
                case 'alquran':
                    if (args.length < 1) return reply(`Example: ${prefix + command} 18 or ${prefix + command} 18/10 or ${prefix + command} 18/1-10`)
                    urls = `http://api.lolhuman.xyz/api/quran/${args[0]}?apikey=${apikey}`
                    quran = await fetchJson(urls)
                    result = quran.result
                    ayat = result.ayat
                    ini_txt = `QS. ${result.surah} : 1-${ayat.length}\n\n`
                    for (var x of ayat) {
                        arab = x.arab
                        nomor = x.ayat
                        latin = x.latin
                        indo = x.indonesia
                        ini_txt += `${arab}\n${nomor}. ${latin}\n${indo}\n\n`
                    }
                    ini_txt = ini_txt.replace(/<u>/g, "").replace(/<\/u>/g, "")
                    ini_txt = ini_txt.replace(/<strong>/g, "").replace(/<\/strong>/g, "")
                    ini_txt = ini_txt.replace(/<u>/g, "").replace(/<\/u>/g, "")
                    reply(ini_txt)
                    break
                case 'alquranaudio':
                    if (args.length == 0) return reply(`Example: ${prefix + command} 18 or ${prefix + command} 18/10`)
                    surah = args[0]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/quran/audio/${surah}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, ini_buffer, audio, { quoted: lol, mimetype: Mimetype.mp4Audio })
                    break
                case 'asmaulhusna':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/asmaulhusna?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `No : ${get_result.index}\n`
                    ini_txt += `Latin: ${get_result.latin}\n`
                    ini_txt += `Arab : ${get_result.ar}\n`
                    ini_txt += `Indonesia : ${get_result.id}\n`
                    ini_txt += `English : ${get_result.en}`
                    reply(ini_txt)
                    break
                case 'kisahnabi':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Muhammad`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/kisahnabi/${query}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Name : ${get_result.name}\n`
                    ini_txt += `Lahir : ${get_result.thn_kelahiran}\n`
                    ini_txt += `Umur : ${get_result.age}\n`
                    ini_txt += `Tempat : ${get_result.place}\n`
                    ini_txt += `Story : \n${get_result.story}`
                    reply(ini_txt)
                    break
                case 'jadwalsholat':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Yogyakarta`)
                    daerah = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/sholat/${daerah}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Wilayah : ${get_result.wilayah}\n`
                    ini_txt += `Tanggal : ${get_result.tanggal}\n`
                    ini_txt += `Sahur : ${get_result.sahur}\n`
                    ini_txt += `Imsak : ${get_result.imsak}\n`
                    ini_txt += `Subuh : ${get_result.subuh}\n`
                    ini_txt += `Terbit : ${get_result.terbit}\n`
                    ini_txt += `Dhuha : ${get_result.dhuha}\n`
                    ini_txt += `Dzuhur : ${get_result.dzuhur}\n`
                    ini_txt += `Ashar : ${get_result.ashar}\n`
                    ini_txt += `Maghrib : ${get_result.imsak}\n`
                    ini_txt += `Isya : ${get_result.isya}`
                    reply(ini_txt)
                    break

                    // Downloader //
                case 'ytplay':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytplay?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    get_info = get_result.info
                    ini_txt = `Title : ${get_info.title}\n`
                    ini_txt += `Uploader : ${get_info.uploader}\n`
                    ini_txt += `Duration : ${get_info.duration}\n`
                    ini_txt += `View : ${get_info.view}\n`
                    ini_txt += `Like : ${get_info.like}\n`
                    ini_txt += `Dislike : ${get_info.dislike}\n`
                    ini_txt += `Description :\n ${get_info.description}\n`
                    ini_buffer = await getBuffer(get_info.thumbnail)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol, caption: ini_txt })
                    get_audio = await getBuffer(get_result.audio[3].link)
                    lolhuman.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${get_info.title}.mp3`, quoted: lol })
                    get_video = await getBuffer(get_result.video[0].link)
                    lolhuman.sendMessage(from, get_video, video, { mimetype: 'video/mp4', filename: `${get_info.title}.mp4`, quoted: lol })
                    break
                case 'ytplay2':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytplay2?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol, caption: get_result.title })
                    get_audio = await getBuffer(get_result.audio)
                    lolhuman.sendMessage(from, get_audio, audio, { mimetype: Mimetype.mp4Audio, filename: `${get_result.title}.mp3`, quoted: lol })
                    get_video = await getBuffer(get_result.video)
                    lolhuman.sendMessage(from, get_video, video, { mimetype: Mimetype.mp4, filename: `${get_result.title}.mp4`, quoted: lol })
                    break
                case 'ytsearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytsearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = ""
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Views : ${x.views}\n`
                        ini_txt += `Published : ${x.published}\n`
                        ini_txt += `Thumbnail : ${x.thumbnail}\n`
                        ini_txt += `Link : https://www.youtube.com/watch?v=${x.videoId}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'ytmp3':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://www.youtube.com/watch?v=qZIQAk-BUEc`)
                    ini_link = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytaudio?apikey=${apikey}&url=${ini_link}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Uploader : ${get_result.uploader}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `View : ${get_result.view}\n`
                    ini_txt += `Like : ${get_result.like}\n`
                    ini_txt += `Dislike : ${get_result.dislike}\n`
                    ini_txt += `Description :\n ${get_result.description}`
                    ini_buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol, caption: ini_txt })
                    get_audio = await getBuffer(get_result.link[3].link)
                    lolhuman.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${get_result.title}.mp3`, quoted: lol })
                    break
                case 'ytmp32':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://www.youtube.com/watch?v=qZIQAk-BUEc`)
                    ini_link = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytaudio2?apikey=${apikey}&url=${ini_link}`)
                    get_result = get_result.result
                    ini_txt = `${get_result.title} - ${get_result.size}`
                    ini_buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol, caption: ini_txt })
                    get_audio = await getBuffer(get_result.link)
                    lolhuman.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${get_result.title}.mp3`, quoted: lol })
                    break
                case 'ytmp4':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://www.youtube.com/watch?v=qZIQAk-BUEc`)
                    ini_link = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytvideo?apikey=${apikey}&url=${ini_link}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Uploader : ${get_result.uploader}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `View : ${get_result.view}\n`
                    ini_txt += `Like : ${get_result.like}\n`
                    ini_txt += `Dislike : ${get_result.dislike}\n`
                    ini_txt += `Description :\n ${get_result.description}`
                    ini_buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol, caption: ini_txt })
                    get_audio = await getBuffer(get_result.link[0].link)
                    lolhuman.sendMessage(from, get_audio, video, { mimetype: 'video/mp4', filename: `${get_result.title}.mp4`, quoted: lol })
                    break
                case 'ytmp42':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://www.youtube.com/watch?v=qZIQAk-BUEc`)
                    ini_link = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ytvideo2?apikey=${apikey}&url=${ini_link}`)
                    get_result = get_result.result
                    ini_txt = `${get_result.title} - ${get_result.size}`
                    ini_buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol, caption: ini_txt })
                    get_audio = await getBuffer(get_result.link)
                    lolhuman.sendMessage(from, get_audio, video, { mimetype: 'video/mp4', filename: `${get_result.title}.mp4`, quoted: lol })
                    break
                case 'telesticker':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://t.me/addstickers/LINE_Menhera_chan_ENG`)
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/telestick?apikey=${apikey}&url=${ini_url}`)
                    ini_sticker = ini_url.result.sticker
                    for (sticker_ in ini_sticker) {
                        ini_buffer = await getBuffer(ini_sticker[sticker_])
                        lolhuman.sendMessage(from, ini_buffer, sticker)
                    }
                    break
                case 'tiktoknowm':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://vt.tiktok.com/ZSwWCk5o/`)
                    ini_url = args[0]
                    ini_url = `http://api.lolhuman.xyz/api/tiktok?apikey=${apikey}&url=${ini_url}`
                    get_result = await fetchJson(ini_url)
                    ini_buffer = await getBuffer(get_result.result.link)
                    lolhuman.sendMessage(from, ini_buffer, video, { quoted: lol })
                    break
                case 'tiktokmusic':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://vt.tiktok.com/ZSwWCk5o/`)
                    ini_link = args[0]
                    get_audio = await getBuffer(`http://api.lolhuman.xyz/api/tiktokmusic?apikey=${apikey}&url=${ini_link}`)
                    lolhuman.sendMessage(from, get_audio, audio, { mimetype: Mimetype.mp4Audio, quoted: lol })
                    break
                case 'spotify':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://open.spotify.com/track/0ZEYRVISCaqz5yamWZWzaA`)
                    url = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/spotify?apikey=${apikey}&url=${url}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Artists : ${get_result.artists}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `Popularity : ${get_result.popularity}\n`
                    ini_txt += `Preview : ${get_result.preview_url}\n`
                    thumbnail = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
                    get_audio = await getBuffer(get_result.link)
                    lolhuman.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${get_result.title}.mp3`, quoted: lol })
                    break
                case 'spotifysearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/spotifysearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = ""
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Artists : ${x.artists}\n`
                        ini_txt += `Duration : ${x.duration}\n`
                        ini_txt += `Link : ${x.link}\n`
                        ini_txt += `Preview : ${x.preview_url}\n\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'jooxplay':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/jooxplay?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.info.song}\n`
                    ini_txt += `Artists : ${get_result.info.singer}\n`
                    ini_txt += `Duration : ${get_result.info.duration}\n`
                    ini_txt += `Album : ${get_result.info.album}\n`
                    ini_txt += `Uploaded : ${get_result.info.date}\n`
                    ini_txt += `Lirik :\n ${get_result.lirik}\n`
                    thumbnail = await getBuffer(get_result.image)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
                    get_audio = await getBuffer(get_result.audio[0].link)
                    lolhuman.sendMessage(from, get_audio, audio, { mimetype: 'audio/mp4', filename: `${get_result.info.song}.mp3`, quoted: lol })
                    break
                case 'igdl':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://www.instagram.com/p/CJ8XKFmJ4al/?igshid=1acpcqo44kgkn`)
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/instagram?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result
                    ini_type = image
                    if (ini_url.includes(".mp4")) ini_type = video
                    ini_buffer = await getBuffer(ini_url)
                    lolhuman.sendMessage(from, ini_buffer, ini_type, { quoted: lol })
                    break
                case 'twtdl':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://twitter.com/gofoodindonesia/status/1229369819511709697`)
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/twitter?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result
                    ini_url = ini_url[ini_url.length - 1].link
                    ini_buffer = await getBuffer(ini_url)
                    lolhuman.sendMessage(from, ini_buffer, video, { quoted: lol })
                    break
                case 'fbdl':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://id-id.facebook.com/SamsungGulf/videos/video-bokeh/561108457758458/`)
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/facebook?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result[0].link
                    ini_buffer = await getBuffer(ini_url)
                    lolhuman.sendMessage(from, ini_buffer, video, { quoted: lol })
                    break
                case 'zippyshare':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://www51.zippyshare.com/v/5W0TOBz1/file.html`)
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/zippyshare?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result
                    ini_txt = `File Name : ${ini_url.name_file}\n`
                    ini_txt += `Size : ${ini_url.size}\n`
                    ini_txt += `Date Upload : ${ini_url.date_upload}\n`
                    ini_txt += `Download Url : ${ini_url.download_url}`
                    reply(ini_txt)
                    break
                case 'pinterest':
                    if (args.length == 0) return reply(`Example: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/pinterest?apikey=${apikey}&query=${query}`)
                    ini_url = ini_url.result
                    ini_buffer = await getBuffer(ini_url)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'pinterestdl':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://id.pinterest.com/pin/696580267364426905/`)
                    ini_url = args[0]
                    ini_url = await fetchJson(`http://api.lolhuman.xyz/api/pinterestdl?apikey=${apikey}&url=${ini_url}`)
                    ini_url = ini_url.result[0]
                    ini_buffer = await getBuffer(ini_url)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'pixiv':
                    if (args.length == 0) return reply(`Example: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/pixiv?apikey=${apikey}&query=${query}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'pixivdl':
                    if (args.length == 0) return reply(`Example: ${prefix + command} 63456028`)
                    query = args[0]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/pixivdl/${pixivid}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'xhamstersearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Japanese`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/xhamstersearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = ""
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Views : ${x.views}\n`
                        ini_txt += `Duration : ${x.duration}\n`
                        ini_txt += `Link : ${x.link}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'xhamster':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://xhamster.com/videos/party-with-friends-end-in-awesome-fucking-5798407`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/xhamster?apikey=${apikey}&url=${query}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `Uploader : ${get_result.author}\n`
                    ini_txt += `Upload : ${get_result.upload}\n`
                    ini_txt += `View : ${get_result.views}\n`
                    ini_txt += `Rating : ${get_result.rating}\n`
                    ini_txt += `Like : ${get_result.likes}\n`
                    ini_txt += `Dislike : ${get_result.dislikes}\n`
                    ini_txt += `Comment : ${get_result.comments}\n`
                    ini_txt += "Link : \n"
                    link = get_result.link
                    for (var x of link) {
                        ini_txt += `${x.type} - ${x.link}\n\n`
                    }
                    thumbnail = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
                    break
                case 'xnxxsearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Japanese`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/xnxxsearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = ""
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Views : ${x.views}\n`
                        ini_txt += `Duration : ${x.duration}\n`
                        ini_txt += `Uploader : ${x.uploader}\n`
                        ini_txt += `Link : ${x.link}\n`
                        ini_txt += `Thumbnail : ${x.thumbnail}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'xnxx':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://www.xnxx.com/video-uy5a73b/mom_is_horny_-_brooklyn`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/xnxx?apikey=${apikey}&url=${query}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `View : ${get_result.view}\n`
                    ini_txt += `Rating : ${get_result.rating}\n`
                    ini_txt += `Like : ${get_result.like}\n`
                    ini_txt += `Dislike : ${get_result.dislike}\n`
                    ini_txt += `Comment : ${get_result.comment}\n`
                    ini_txt += `Tag : ${get_result.tag.join(", ")}\n`
                    ini_txt += `Description : ${get_result.description}\n`
                    ini_txt += "Link : \n"
                    ini_link = get_result.link
                    for (var x of ini_link) {
                        ini_txt += `${x.type} - ${x.link}\n\n`
                    }
                    thumbnail = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
                    break

                    // AniManga //
                case 'character':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Miku Nakano`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/character?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Id : ${get_result.id}\n`
                    ini_txt += `Name : ${get_result.name.full}\n`
                    ini_txt += `Native : ${get_result.name.native}\n`
                    ini_txt += `Favorites : ${get_result.favourites}\n`
                    ini_txt += `Media : \n`
                    ini_media = get_result.media.nodes
                    for (var x of ini_media) {
                        ini_txt += `- ${x.title.romaji} (${x.title.native})\n`
                    }
                    ini_txt += `\nDescription : \n${get_result.description.replace(/__/g, "_")}`
                    thumbnail = await getBuffer(get_result.image.large)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
                    break
                case 'manga':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Gotoubun No Hanayome`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/manga?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Id : ${get_result.id}\n`
                    ini_txt += `Id MAL : ${get_result.idMal}\n`
                    ini_txt += `Title : ${get_result.title.romaji}\n`
                    ini_txt += `English : ${get_result.title.english}\n`
                    ini_txt += `Native : ${get_result.title.native}\n`
                    ini_txt += `Format : ${get_result.format}\n`
                    ini_txt += `Chapters : ${get_result.chapters}\n`
                    ini_txt += `Volume : ${get_result.volumes}\n`
                    ini_txt += `Status : ${get_result.status}\n`
                    ini_txt += `Source : ${get_result.source}\n`
                    ini_txt += `Start Date : ${get_result.startDate.day} - ${get_result.startDate.month} - ${get_result.startDate.year}\n`
                    ini_txt += `End Date : ${get_result.endDate.day} - ${get_result.endDate.month} - ${get_result.endDate.year}\n`
                    ini_txt += `Genre : ${get_result.genres.join(", ")}\n`
                    ini_txt += `Synonyms : ${get_result.synonyms.join(", ")}\n`
                    ini_txt += `Score : ${get_result.averageScore}%\n`
                    ini_txt += `Characters : \n`
                    ini_character = get_result.characters.nodes
                    for (var x of ini_character) {
                        ini_txt += `- ${x.name.full} (${x.name.native})\n`
                    }
                    ini_txt += `\nDescription : ${get_result.description}`
                    thumbnail = await getBuffer(get_result.coverImage.large)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
                    break
                case 'anime':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Gotoubun No Hanayome`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/anime?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Id : ${get_result.id}\n`
                    ini_txt += `Id MAL : ${get_result.idMal}\n`
                    ini_txt += `Title : ${get_result.title.romaji}\n`
                    ini_txt += `English : ${get_result.title.english}\n`
                    ini_txt += `Native : ${get_result.title.native}\n`
                    ini_txt += `Format : ${get_result.format}\n`
                    ini_txt += `Episodes : ${get_result.episodes}\n`
                    ini_txt += `Duration : ${get_result.duration} mins.\n`
                    ini_txt += `Status : ${get_result.status}\n`
                    ini_txt += `Season : ${get_result.season}\n`
                    ini_txt += `Season Year : ${get_result.seasonYear}\n`
                    ini_txt += `Source : ${get_result.source}\n`
                    ini_txt += `Start Date : ${get_result.startDate.day} - ${get_result.startDate.month} - ${get_result.startDate.year}\n`
                    ini_txt += `End Date : ${get_result.endDate.day} - ${get_result.endDate.month} - ${get_result.endDate.year}\n`
                    ini_txt += `Genre : ${get_result.genres.join(", ")}\n`
                    ini_txt += `Synonyms : ${get_result.synonyms.join(", ")}\n`
                    ini_txt += `Score : ${get_result.averageScore}%\n`
                    ini_txt += `Characters : \n`
                    ini_character = get_result.characters.nodes
                    for (var x of ini_character) {
                        ini_txt += `- ${x.name.full} (${x.name.native})\n`
                    }
                    ini_txt += `\nDescription : ${get_result.description}`
                    thumbnail = await getBuffer(get_result.coverImage.large)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
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
                        ini_txt = `Anilist id : ${get_result.anilist_id}\n`
                        ini_txt += `MAL id : ${get_result.mal_id}\n`
                        ini_txt += `Title Romaji : ${get_result.title_romaji}\n`
                        ini_txt += `Title Native : ${get_result.title_native}\n`
                        ini_txt += `Title English : ${get_result.title_english}\n`
                        ini_txt += `at : ${get_result.at}\n`
                        ini_txt += `Episode : ${get_result.episode}\n`
                        ini_txt += `Similarity : ${get_result.similarity}`
                        lolhuman.sendMessage(from, ini_video, video, { quoted: lol, caption: ini_txt })
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'kusonime':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://kusonime.com/nanatsu-no-taizai-bd-batch-subtitle-indonesia/`)
                    ini_url = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/kusonime?apikey=${apikey}&url=${ini_url}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Japanese : ${get_result.japanese}\n`
                    ini_txt += `Genre : ${get_result.genre}\n`
                    ini_txt += `Seasons : ${get_result.seasons}\n`
                    ini_txt += `Producers : ${get_result.producers}\n`
                    ini_txt += `Type : ${get_result.type}\n`
                    ini_txt += `Status : ${get_result.status}\n`
                    ini_txt += `Total Episode : ${get_result.total_episode}\n`
                    ini_txt += `Score : ${get_result.score}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `Released On : ${get_result.released_on}\n`
                    ini_txt += `Desc : ${get_result.desc}\n`
                    link_dl = get_result.link_dl
                    for (var x in link_dl) {
                        ini_txt += `\n${x}\n`
                        for (var y in link_dl[x]) {
                            ini_txt += `${y} - ${link_dl[x][y]}\n`
                        }
                    }
                    ini_buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol, caption: ini_txt })
                    break
                case 'kusonimesearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Gotoubun No Hanayome`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/kusonimesearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Japanese : ${get_result.japanese}\n`
                    ini_txt += `Genre : ${get_result.genre}\n`
                    ini_txt += `Seasons : ${get_result.seasons}\n`
                    ini_txt += `Producers : ${get_result.producers}\n`
                    ini_txt += `Type : ${get_result.type}\n`
                    ini_txt += `Status : ${get_result.status}\n`
                    ini_txt += `Total Episode : ${get_result.total_episode}\n`
                    ini_txt += `Score : ${get_result.score}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `Released On : ${get_result.released_on}\n`
                    ini_txt += `Desc : ${get_result.desc}\n`
                    link_dl = get_result.link_dl
                    for (var x in link_dl) {
                        ini_txt += `\n${x}\n`
                        for (var y in link_dl[x]) {
                            ini_txt += `${y} - ${link_dl[x][y]}\n`
                        }
                    }
                    ini_buffer = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol, caption: ini_txt })
                    break
                case 'otakudesu':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://otakudesu.tv/lengkap/pslcns-sub-indo/`)
                    ini_url = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/otakudesu?apikey=${apikey}&url=${ini_url}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Japanese : ${get_result.japanese}\n`
                    ini_txt += `Judul : ${get_result.judul}\n`
                    ini_txt += `Type : ${get_result.type}\n`
                    ini_txt += `Episode : ${get_result.episodes}\n`
                    ini_txt += `Aired : ${get_result.aired}\n`
                    ini_txt += `Producers : ${get_result.producers}\n`
                    ini_txt += `Genre : ${get_result.genres}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `Studios : ${get_result.status}\n`
                    ini_txt += `Rating : ${get_result.rating}\n`
                    ini_txt += `Credit : ${get_result.credit}\n`
                    get_link = get_result.link_dl
                    for (var x in get_link) {
                        ini_txt += `\n\n*${get_link[x].title}*\n`
                        for (var y in get_link[x].link_dl) {
                            ini_info = get_link[x].link_dl[y]
                            ini_txt += `\n\`\`\`Reso : \`\`\`${ini_info.reso}\n`
                            ini_txt += `\`\`\`Size : \`\`\`${ini_info.size}\n`
                            ini_txt += `\`\`\`Link : \`\`\`\n`
                            down_link = ini_info.link_dl
                            for (var z in down_link) {
                                ini_txt += `${z} - ${down_link[z]}\n`
                            }
                        }
                    }
                    reply(ini_txt)
                    break
                case 'otakudesusearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Gotoubun No Hanayome`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/otakudesusearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Japanese : ${get_result.japanese}\n`
                    ini_txt += `Judul : ${get_result.judul}\n`
                    ini_txt += `Type : ${get_result.type}\n`
                    ini_txt += `Episode : ${get_result.episodes}\n`
                    ini_txt += `Aired : ${get_result.aired}\n`
                    ini_txt += `Producers : ${get_result.producers}\n`
                    ini_txt += `Genre : ${get_result.genres}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `Studios : ${get_result.status}\n`
                    ini_txt += `Rating : ${get_result.rating}\n`
                    ini_txt += `Credit : ${get_result.credit}\n`
                    get_link = get_result.link_dl
                    for (var x in get_link) {
                        ini_txt += `\n\n*${get_link[x].title}*\n`
                        for (var y in get_link[x].link_dl) {
                            ini_info = get_link[x].link_dl[y]
                            ini_txt += `\n\`\`\`Reso : \`\`\`${ini_info.reso}\n`
                            ini_txt += `\`\`\`Size : \`\`\`${ini_info.size}\n`
                            ini_txt += `\`\`\`Link : \`\`\`\n`
                            down_link = ini_info.link_dl
                            for (var z in down_link) {
                                ini_txt += `${z} - ${down_link[z]}\n`
                            }
                        }
                    }
                    reply(ini_txt)
                    break
                case 'nhentai':
                    if (args.length == 0) return reply(`Example: ${prefix + command} 344253`)
                    henid = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/nhentai/${henid}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Title Romaji : ${get_result.title_romaji}\n`
                    ini_txt += `Title Native : ${get_result.title_native}\n`
                    ini_txt += `Read Online : ${get_result.read}\n`
                    get_info = get_result.info
                    ini_txt += `Parodies : ${get_info.parodies}\n`
                    ini_txt += `Character : ${get_info.characters.join(", ")}\n`
                    ini_txt += `Tags : ${get_info.tags.join(", ")}\n`
                    ini_txt += `Artist : ${get_info.artists}\n`
                    ini_txt += `Group : ${get_info.groups}\n`
                    ini_txt += `Languager : ${get_info.languages.join(", ")}\n`
                    ini_txt += `Categories : ${get_info.categories}\n`
                    ini_txt += `Pages : ${get_info.pages}\n`
                    ini_txt += `Uploaded : ${get_info.uploaded}\n`
                    reply(ini_txt)
                    break
                case 'nhentaipdf':
                    if (args.length == 0) return reply(`Example: ${prefix + command} 344253`)
                    henid = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/nhentaipdf/${henid}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_buffer = await getBuffer(get_result)
                    lolhuman.sendMessage(from, ini_buffer, document, { quoted: lol, mimetype: Mimetype.pdf, filename: `${henid}.pdf` })
                    break
                case 'nhentaisearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Gotoubun No Hanayome`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/nhentaisearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = "Result : \n"
                    for (var x of get_result) {
                        ini_txt += `Id : ${x.id}\n`
                        ini_txt += `Title English : ${x.title_english}\n`
                        ini_txt += `Title Japanese : ${x.title_japanese}\n`
                        ini_txt += `Native : ${x.title_native}\n`
                        ini_txt += `Upload : ${x.date_upload}\n`
                        ini_txt += `Page : ${x.page}\n`
                        ini_txt += `Favourite : ${x.favourite}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'nekopoi':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://nekopoi.care/isekai-harem-monogatari-episode-4-subtitle-indonesia/`)
                    ini_url = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/nekopoi?apikey=${apikey}&url=${ini_url}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.anime}\n`
                    ini_txt += `Porducers : ${get_result.producers}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `Size : ${get_result.size}\n`
                    ini_txt += `Sinopsis : ${get_result.sinopsis}\n`
                    link = get_result.link
                    for (var x in link) {
                        ini_txt += `\n${link[x].name}\n`
                        link_dl = link[x].link
                        for (var y in link_dl) {
                            ini_txt += `${y} - ${link_dl[y]}\n`
                        }
                    }
                    ini_buffer = await getBuffer(get_result.thumb)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol, caption: ini_txt })
                    break
                case 'nekopoisearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Isekai Harem`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/nekopoisearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = ""
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Link : ${x.link}\n`
                        ini_txt += `Thumbnail : ${x.thumbnail}\n\n`
                    }
                    reply(ini_txt)
                    break

                    // Information //
                case 'heroml':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Fanny`)
                    hero = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/heroml/${hero}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Name : ${get_result.hero_name}\n`
                    ini_txt += `Entrance Quotes : ${get_result.ent_quotes}\n`
                    ini_txt += `Role : ${get_result.detail.role}\n`
                    ini_txt += `Specialty : ${get_result.detail.specialty}\n`
                    ini_txt += `Laning : ${get_result.detail.laning_recommendation}\n`
                    ini_txt += `Release : ${get_result.detail.release_date}\n`
                    ini_txt += `Movement speed : ${get_result.attr.movement_speed}\n`
                    ini_txt += `Physical attack : ${get_result.attr.physical_attack}\n`
                    ini_txt += `Magic power : ${get_result.attr.magic_power}\n`
                    ini_txt += `Physical defense : ${get_result.attr.physical_defense}\n`
                    ini_txt += `Magic defense : ${get_result.attr.magic_defense}\n`
                    ini_txt += `Critical rate : ${get_result.attr.basic_atk_crit_rate}\n`
                    ini_txt += `Hp : ${get_result.attr.hp}\n`
                    ini_txt += `Mana : ${get_result.attr.mana}\n`
                    ini_txt += `Mana regen : ${get_result.attr.mana_regen}\n`
                    ini_icon = await getBuffer(get_result.icon)
                    lolhuman.sendMessage(from, ini_icon, image, { quoted: lol, caption: ini_txt })
                    break
                case 'genshin':
                    if (args.length == 0) return reply(`Example: ${prefix + command} jean`)
                    hero = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/genshin/${hero}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Name : ${get_result.title}\n`
                    ini_txt += `Intro : ${get_result.intro}\n`
                    ini_txt += `Icon : ${get_result.icon}\n`
                    ini_icon = await getBuffer(get_result.cover1)
                    lolhuman.sendMessage(from, ini_icon, image, { quoted: lol, caption: ini_txt })
                    ini_voice = await getBuffer(get_result.cv[0].audio[0])
                    lolhuman.sendMessage(from, ini_voice, audio, { quoted: lol, mimetype: Mimetype.mp4Audio })
                    break
                case 'wikipedia':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Tahu`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/wiki?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    reply(get_result)
                    break
                case 'translate':
                    if (args.length == 0) return reply(`Example: ${prefix + command} en Tahu Bacem`)
                    kode_negara = args[0]
                    args.shift()
                    ini_txt = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/translate/auto/${kode_negara}?apikey=${apikey}&text=${ini_txt}`)
                    get_result = get_result.result
                    init_txt = `From : ${get_result.from}\n`
                    init_txt += `To : ${get_result.to}\n`
                    init_txt += `Original : ${get_result.original}\n`
                    init_txt += `Translated : ${get_result.translated}\n`
                    init_txt += `Pronunciation : ${get_result.pronunciation}\n`
                    reply(init_txt)
                    break
                case 'brainly':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Soekarno adalah`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/brainly?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = "Result : \n"
                    for (var x of get_result) {
                        ini_txt += `${x.title}\n`
                        ini_txt += `${x.url}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'jadwaltv':
                    if (args.length == 0) return reply(`Example: ${prefix + command} RCTI`)
                    channel = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/jadwaltv/${channel}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Jadwal TV ${channel.toUpperCase()}\n`
                    for (var x in get_result) {
                        ini_txt += `${x} - ${get_result[x]}\n`
                    }
                    reply(ini_txt)
                    break
                case 'jadwaltvnow':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/jadwaltv/now?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Jadwal TV Now :\n`
                    for (var x in get_result) {
                        ini_txt += `${x.toUpperCase()}${get_result[x]}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'newsinfo':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/newsinfo?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = "Result :\n"
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Author : ${x.author}\n`
                        ini_txt += `Source : ${x.source.name}\n`
                        ini_txt += `Url : ${x.url}\n`
                        ini_txt += `Published : ${x.publishedAt}\n`
                        ini_txt += `Description : ${x.description}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'cnnindonesia':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/cnnindonesia?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = "Result :\n"
                    for (var x of get_result) {
                        ini_txt += `Judul : ${x.judul}\n`
                        ini_txt += `Link : ${x.link}\n`
                        ini_txt += `Tipe : ${x.tipe}\n`
                        ini_txt += `Published : ${x.waktu}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'cnnnasional':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/cnnindonesia/nasional?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = "Result :\n"
                    for (var x of get_result) {
                        ini_txt += `Judul : ${x.judul}\n`
                        ini_txt += `Link : ${x.link}\n`
                        ini_txt += `Tipe : ${x.tipe}\n`
                        ini_txt += `Published : ${x.waktu}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'cnninternasional':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/cnnindonesia/internasional?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = "Result :\n"
                    for (var x of get_result) {
                        ini_txt += `Judul : ${x.judul}\n`
                        ini_txt += `Link : ${x.link}\n`
                        ini_txt += `Tipe : ${x.tipe}\n`
                        ini_txt += `Published : ${x.waktu}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'infogempa':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/infogempa?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Lokasi : ${get_result.lokasi}\n`
                    ini_txt += `Waktu : ${get_result.waktu}\n`
                    ini_txt += `Potensi : ${get_result.potensi}\n`
                    ini_txt += `Magnitude : ${get_result.magnitude}\n`
                    ini_txt += `Kedalaman : ${get_result.kedalaman}\n`
                    ini_txt += `Koordinat : ${get_result.koordinat}`
                    get_buffer = await getBuffer(get_result.map)
                    lolhuman.sendMessage(from, get_buffer, image, { quoted: lol, caption: ini_txt })
                    break
                case 'lirik':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Melukis Senja`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/lirik?apikey=${apikey}&query=${query}`)
                    reply(get_result.result)
                    break
                case 'cuaca':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Yogyakarta`)
                    daerah = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/cuaca/${daerah}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Tempat : ${get_result.tempat}\n`
                    ini_txt += `Cuaca : ${get_result.cuaca}\n`
                    ini_txt += `Angin : ${get_result.angin}\n`
                    ini_txt += `Description : ${get_result.description}\n`
                    ini_txt += `Kelembapan : ${get_result.kelembapan}\n`
                    ini_txt += `Suhu : ${get_result.suhu}\n`
                    ini_txt += `Udara : ${get_result.udara}\n`
                    ini_txt += `Permukaan laut : ${get_result.permukaan_laut}\n`
                    lolhuman.sendMessage(from, { degreesLatitude: get_result.latitude, degreesLongitude: get_result.longitude }, location, { quoted: lol })
                    reply(ini_txt)
                    break
                case 'covidindo':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/corona/indonesia?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Positif : ${get_result.positif}\n`
                    ini_txt += `Sembuh : ${get_result.sembuh}\n`
                    ini_txt += `Dirawat : ${get_result.dirawat}\n`
                    ini_txt += `Meninggal : ${get_result.meninggal}`
                    reply(ini_txt)
                    break
                case 'covidglobal':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/corona/global?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Positif : ${get_result.positif}\n`
                    ini_txt += `Sembuh : ${get_result.sembuh}\n`
                    ini_txt += `Dirawat : ${get_result.dirawat}\n`
                    ini_txt += `Meninggal : ${get_result.meninggal}`
                    reply(ini_txt)
                    break
                case 'kodepos':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Slemanan or ${prefix + command} 66154`)
                    daerah = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/kodepos?apikey=${apikey}&query=${daerah}`)
                    get_result = get_result.result[0]
                    ini_txt = `Provinsi : ${get_result.province}\n`
                    ini_txt += `Kabupaten : ${get_result.city}\n`
                    ini_txt += `Kecamatan : ${get_result.subdistrict}\n`
                    ini_txt += `Kelurahan : ${get_result.urban}\n`
                    ini_txt += `Kode Pos : ${get_result.postalcode}`
                    reply(ini_txt)
                    break
                case 'jadwalbola':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/jadwalbola?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = "Jadwal Bola :\n"
                    for (var x of get_result) {
                        ini_txt += `Hari : ${x.hari}\n`
                        ini_txt += `Jam : ${x.jam}\n`
                        ini_txt += `Event : ${x.event}\n`
                        ini_txt += `Match : ${x.match}\n`
                        ini_txt += `TV : ${x.tv}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'indbeasiswa':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/indbeasiswa?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = 'Info Beasiswa :\n'
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Link : ${x.link}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'hoax':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/turnbackhoax?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = 'Info Hoax :\n'
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Link : ${x.link}\n`
                        ini_txt += `Posted : ${x.posted}\n`
                        ini_txt += `Description : ${x.desc}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'nsfwcheck':
                    if ((isMedia && !lol.message.videoMessage || isQuotedImage) && args.length == 0) {
                        var encmedia = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        var filePath = await lolhuman.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        var form = new FormData();
                        var stats = fs.statSync(filePath);
                        var fileSizeInBytes = stats.size;
                        var fileStream = fs.createReadStream(filePath);
                        form.append('img', fileStream, { knownLength: fileSizeInBytes });
                        var options = {
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
                case 'ocr':
                    if ((isMedia && !lol.message.videoMessage || isQuotedImage) && args.length == 0) {
                        var encmedia = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        var filePath = await lolhuman.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        var form = new FormData();
                        var stats = fs.statSync(filePath);
                        var fileSizeInBytes = stats.size;
                        var fileStream = fs.createReadStream(filePath);
                        form.append('img', fileStream, { knownLength: fileSizeInBytes });
                        var options = {
                            method: 'POST',
                            credentials: 'include',
                            body: form
                        }
                        get_result = await fetchJson(`http://api.lolhuman.xyz/api/ocr?apikey=${apikey}`, {...options })
                        fs.unlinkSync(filePath)
                        get_result = get_result.result
                        reply(`Result : ${get_result}`)
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break

                    // Movie & Story
                case 'lk21':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Transformer`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/lk21?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Link : ${get_result.link}\n`
                    ini_txt += `Genre : ${get_result.genre}\n`
                    ini_txt += `Views : ${get_result.views}\n`
                    ini_txt += `Duration : ${get_result.duration}\n`
                    ini_txt += `Tahun : ${get_result.tahun}\n`
                    ini_txt += `Rating : ${get_result.rating}\n`
                    ini_txt += `Desc : ${get_result.desc}\n`
                    ini_txt += `Actors : ${get_result.actors.join(", ")}\n`
                    ini_txt += `Location : ${get_result.location}\n`
                    ini_txt += `Date Release : ${get_result.date_release}\n`
                    ini_txt += `Language : ${get_result.language}\n`
                    ini_txt += `Link Download : ${get_result.link_dl}`
                    thumbnail = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
                    break
                case 'drakorongoing':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/drakorongoing?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = "Ongoing Drakor\n\n"
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Link : ${x.link}\n`
                        ini_txt += `Thumbnail : ${x.thumbnail}\n`
                        ini_txt += `Year : ${x.category}\n`
                        ini_txt += `Total Episode : ${x.total_episode}\n`
                        ini_txt += `Genre : ${x.genre.join(", ")}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'wattpad':
                    if (args.length == 0) return reply(`Example: ${prefix + command} https://www.wattpad.com/707367860-kumpulan-quote-tere-liye-tere-liye-quote-quote`)
                    ini_url = args[0]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/wattpad?apikey=${apikey}&url=${ini_url}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Rating : ${get_result.rating}\n`
                    ini_txt += `Motify date : ${get_result.modifyDate}\n`
                    ini_txt += `Create date: ${get_result.createDate}\n`
                    ini_txt += `Word : ${get_result.word}\n`
                    ini_txt += `Comment : ${get_result.comment}\n`
                    ini_txt += `Vote : ${get_result.vote}\n`
                    ini_txt += `Reader : ${get_result.reader}\n`
                    ini_txt += `Pages : ${get_result.pages}\n`
                    ini_txt += `Description : ${get_result.desc}\n\n`
                    ini_txt += `Story : \n${get_result.story}`
                    thumbnail = await getBuffer(get_result.photo)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
                    break
                case 'wattpadsearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Tere Liye`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/wattpadsearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = "Wattpad Seach : \n"
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Url : ${x.url}\n`
                        ini_txt += `Part : ${x.parts}\n`
                        ini_txt += `Motify date : ${x.modifyDate}\n`
                        ini_txt += `Create date: ${x.createDate}\n`
                        ini_txt += `Coment count: ${x.commentCount}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'cerpen':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/cerpen?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Creator : ${get_result.creator}\n`
                    ini_txt += `Story :\n${get_result.cerpen}`
                    reply(ini_txt)
                    break
                case 'ceritahoror':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/ceritahoror?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Title : ${get_result.title}\n`
                    ini_txt += `Desc : ${get_result.desc}\n`
                    ini_txt += `Story :\n${get_result.story}\n`
                    thumbnail = await getBuffer(get_result.thumbnail)
                    lolhuman.sendMessage(from, thumbnail, image, { quoted: lol, caption: ini_txt })
                    break

                    // Random Text //
                case 'quotes':
                    quotes = await fetchJson(`http://api.lolhuman.xyz/api/random/quotes?apikey=${apikey}`)
                    quotes = quotes.result
                    author = quotes.by
                    quotes = quotes.quote
                    reply(`_${quotes}_\n\n*― ${author}*`)
                    break
                case 'quotesanime':
                    quotes = await fetchJson(`http://api.lolhuman.xyz/api/random/quotesnime?apikey=${apikey}`)
                    quotes = quotes.result
                    quote = quotes.quote
                    char = quotes.character
                    anime = quotes.anime
                    episode = quotes.episode
                    reply(`_${quote}_\n\n*― ${char}*\n*― ${anime} ${episode}*`)
                    break
                case 'quotesdilan':
                    quotedilan = await fetchJson(`http://api.lolhuman.xyz/api/quotes/dilan?apikey=${apikey}`)
                    reply(quotedilan.result)
                    break
                case 'quotesimage':
                    get_result = await getBuffer(`http://api.lolhuman.xyz/api/random/${command}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, get_result, image, { quotes: lol })
                    break
                case 'faktaunik':
                case 'katabijak':
                case 'pantun':
                case 'bucin':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/random/${command}?apikey=${apikey}`)
                    reply(get_result.result)
                    break
                case 'randomnama':
                    anu = await fetchJson(`http://api.lolhuman.xyz/api/random/nama?apikey=${apikey}`)
                    reply(anu.result)
                    break

                    // Searching
                case 'gimage':
                    if (args.length == 0) return reply(`Example: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/gimage?apikey=${apikey}&query=${query}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'gimage2':
                    if (args.length == 0) return reply(`Example: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/gimage2?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    for (var x = 0; x <= 5; x++) {
                        var ini_buffer = await getBuffer(get_result[x])
                        lolhuman.sendMessage(from, ini_buffer, image)
                    }
                    break
                case 'konachan':
                    if (args.length == 0) return reply(`Example: ${prefix + command} azur_lane`)
                    query = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/konachan?apikey=${apikey}&query=${query}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'wallpapersearch':
                    if (args.length == 0) return reply(`Example: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/wallpaper?apikey=${apikey}&query=${query}`)
                    ini_buffer = await getBuffer(get_result.result)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'wallpapersearch2':
                    if (args.length == 0) return reply(`Example: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/wallpaper2?apikey=${apikey}&query=${query}`)
                    ini_buffer = await getBuffer(get_result.result)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'playstore':
                    if (args.length == 0) return reply(`Example: ${prefix + command} telegram`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/playstore?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = 'Play Store Search : \n'
                    for (var x of get_result) {
                        ini_txt += `Name : ${x.title}\n`
                        ini_txt += `ID : ${x.appId}\n`
                        ini_txt += `Developer : ${x.developer}\n`
                        ini_txt += `Link : ${x.url}\n`
                        ini_txt += `Price : ${x.priceText}\n`
                        ini_txt += `Price : ${x.price}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'shopee':
                    if (args.length == 0) return reply(`Example: ${prefix + command} tas gendong`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/shopee?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = 'Shopee Search : \n'
                    for (var x of get_result) {
                        ini_txt += `Name : ${x.name}\n`
                        ini_txt += `Terjual : ${x.sold}\n`
                        ini_txt += `Stock : ${x.stock}\n`
                        ini_txt += `Lokasi : ${x.shop_loc}\n`
                        ini_txt += `Link : ${x.link_produk}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'google':
                    if (args.length == 0) return reply(`Example: ${prefix + command} loli kawaii`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/gsearch?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result
                    ini_txt = 'Google Search : \n'
                    for (var x of get_result) {
                        ini_txt += `Title : ${x.title}\n`
                        ini_txt += `Link : ${x.link}\n`
                        ini_txt += `Desc : ${x.desc}\n\n`
                    }
                    reply(ini_txt)
                    break
                case 'stickerwa':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Koceng Imot`)
                    query = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/stickerwa?apikey=${apikey}&query=${query}`)
                    get_result = get_result.result[0].stickers
                    for (var x of get_result) {
                        ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/convert/towebp?apikey=${apikey}&img=${x}`)
                        lolhuman.sendMessage(from, ini_buffer, sticker)
                    }
                    break

                    // Primbon
                case 'artinama':
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    ini_nama = args.join(" ")
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/artinama?apikey=${apikey}&nama=${ini_nama}`)
                    reply(get_result.result)
                    break
                case 'jodoh':
                    if (args.length == 0) return reply(`Example: ${prefix + command} Tahu & Bacem`)
                    ini_nama = args.join(" ").split("&")
                    nama1 = ini_nama[0].trim()
                    nama2 = ini_nama[1].trim()
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/jodoh/${nama1}/${nama2}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Positif : ${get_result.positif}\n`
                    ini_txt += `Negative : ${get_result.negatif}\n`
                    ini_txt += `Deskripsi : ${get_result.deskripsi}`
                    reply(ini_txt)
                    break
                case 'weton':
                    if (args.length == 0) return reply(`Example: ${prefix + command} 12 12 2020`)
                    tanggal = args[0]
                    bulan = args[1]
                    tahun = args[2]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/weton/${tanggal}/${bulan}/${tahun}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Weton : ${get_result.weton}\n`
                    ini_txt += `Pekerjaan : ${get_result.pekerjaan}\n`
                    ini_txt += `Rejeki : ${get_result.rejeki}\n`
                    ini_txt += `Jodoh : ${get_result.jodoh}`
                    reply(ini_txt)
                    break
                case 'jadian':
                    if (args.length == 0) return reply(`Example: ${prefix + command} 12 12 2020`)
                    tanggal = args[0]
                    bulan = args[1]
                    tahun = args[2]
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/jadian/${tanggal}/${bulan}/${tahun}?apikey=${apikey}`)
                    get_result = get_result.result
                    ini_txt = `Karakteristik : ${get_result.karakteristik}\n`
                    ini_txt += `Deskripsi : ${get_result.deskripsi}`
                    reply(ini_txt)
                    break
                case 'tebakumur':
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    ini_name = args.join(" ")
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/tebakumur?apikey=SoftApikey&name=${ini_name}`)
                    get_result = get_result.result
                    ini_txt = `Nama : ${get_result.name}\n`
                    ini_txt += `Umur : ${get_result.age}`
                    reply(ini_txt)
                    break

                    // Entertainment
                case 'asupan':
                    get_result = await fetchJson(`http://api.lolhuman.xyz/api/asupan?apikey=${apikey}`)
                    ini_buffer = await getBuffer(get_result.result)
                    lolhuman.sendMessage(from, ini_buffer, video, { quoted: lol, mimetype: Mimetype.mp4, filename: "asupan.mp4" })
                    break
                case 'wancak':
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/onecak?apikey=${apikey}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break

                    // Creator
                case 'quotemaker3':
                    if ((isMedia && !lol.message.videoMessage || isQuotedImage)) {
                        if (args.length == 0) return reply(`Example: ${prefix + command} LoL|Human`)
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        filePath = await lolhuman.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        file_name = getRandom(".webp")
                        ini_txt = args.join(" ")
                        request({
                            url: `http://api.lolhuman.xyz/api/quotemaker3?apikey=${apikey}`,
                            method: 'POST',
                            formData: {
                                "img": fs.createReadStream(filePath),
                                "text": ini_txt
                            },
                            encoding: "binary"
                        }, function(error, response, body) {
                            fs.unlinkSync(filePath)
                            fs.writeFileSync(file_name, body, "binary")
                            ini_buff = fs.readFileSync(file_name)
                            lolhuman.sendMessage(from, ini_buff, image, { quoted: lol })
                            fs.unlinkSync(file_name)
                        });
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'stickerwm':
                    if ((isMedia && !lol.message.videoMessage || isQuotedImage)) {
                        if (args.length == 0) return reply(`Example: ${prefix + command} LoL|Human`)
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        filePath = await lolhuman.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        file_name = getRandom(".webp")
                        ini_txt = args.join(" ").split("|")
                        request({
                            url: `http://api.lolhuman.xyz/api/convert/towebpauthor?apikey=${apikey}`,
                            method: 'POST',
                            formData: {
                                "img": fs.createReadStream(filePath),
                                "package": ini_txt[0],
                                "author": ini_txt[1]
                            },
                            encoding: "binary"
                        }, function(error, response, body) {
                            fs.unlinkSync(filePath)
                            fs.writeFileSync(file_name, body, "binary")
                            ini_buff = fs.readFileSync(file_name)
                            lolhuman.sendMessage(from, ini_buff, sticker, { quoted: lol })
                            fs.unlinkSync(file_name)
                        });
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'sticker':
                    if ((isMedia && !lol.message.videoMessage || isQuotedImage) && args.length == 0) {
                        const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        filePath = await lolhuman.downloadAndSaveMediaMessage(encmedia)
                        file_name = getRandom('.webp')
                        request({
                            url: `http://api.lolhuman.xyz/api/convert/towebp?apikey=${apikey}`,
                            method: 'POST',
                            formData: {
                                "img": fs.createReadStream(filePath)
                            },
                            encoding: "binary"
                        }, function(error, response, body) {
                            fs.unlinkSync(filePath)
                            fs.writeFileSync(file_name, body, "binary")
                            ini_buff = fs.readFileSync(file_name)
                            lolhuman.sendMessage(from, ini_buff, sticker, { quoted: lol })
                            fs.unlinkSync(file_name)
                        });
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix}sticker atau tag gambar yang sudah dikirim`)
                    }
                    break
                case 'takestick':
                    if ((isMedia && !lol.message.videoMessage || isQuotedSticker)) {
                        if (args.length == 0) return reply(`Example: ${prefix + command} LoL|Human`)
                        const encmedia = isQuotedSticker ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        filePath = await lolhuman.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        file_name = getRandom(".webp")
                        ini_txt = args.join(" ").split("|")
                        request({
                            url: `http://api.lolhuman.xyz/api/convert/towebpauthor?apikey=${apikey}`,
                            method: 'POST',
                            formData: {
                                "img": fs.createReadStream(filePath),
                                "package": ini_txt[0],
                                "author": ini_txt[1]
                            },
                            encoding: "binary"
                        }, function(error, response, body) {
                            fs.unlinkSync(filePath)
                            fs.writeFileSync(file_name, body, "binary")
                            ini_buff = fs.readFileSync(file_name)
                            lolhuman.sendMessage(from, ini_buff, sticker, { quoted: lol })
                            fs.unlinkSync(file_name)
                        });
                    } else {
                        reply(`Tag sticker yang sudah dikirim`)
                    }
                    break
                case 'ttp':
                case 'ttp2':
                case 'ttp3':
                case 'ttp4':
                case 'attp':
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/${command}?apikey=${apikey}&text=${ini_txt}`)
                    lolhuman.sendMessage(from, ini_buffer, sticker, { quoted: lol })
                    break
                case 'triggered':
                    ini_url = args[0]
                    ranp = getRandom('.gif')
                    rano = getRandom('.webp')
                    ini_buffer = `http://api.lolhuman.xyz/api/editor/triggered?apikey=${apikey}&img=${ini_url}`
                    exec(`wget "${ini_buffer}" -O ${ranp} && ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${rano}`, (err) => {
                        fs.unlinkSync(ranp)
                        buff = fs.readFileSync(rano)
                        lolhuman.sendMessage(from, buff, sticker, { quoted: lol })
                        fs.unlinkSync(rano)
                    })
                    break
                case 'wasted':
                    ini_url = args[0]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/editor/wasted?apikey=${apikey}&img=${ini_url}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'smoji':
                    if (args.length == 0) return reply(`Example: ${prefix + command} 😭`)
                    emoji = args[0]
                    try {
                        emoji = encodeURI(emoji[0])
                    } catch {
                        emoji = encodeURI(emoji)
                    }
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/smoji/${emoji}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, ini_buffer, sticker, { quoted: lol })
                    break
                case 'fakedonald':
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/tweettrump?apikey=${apikey}&text=${ini_txt}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'faketoko':
                    await faketoko(teks = "Tahu Bacem", url_image = "https://i.ibb.co/JdfQ73m/photo-2021-02-05-10-13-39.jpg", title = "LoL Human", code = "IDR", price = 1000000)
                    break
                case 'ktpmaker':
                    if (args.length == 0) return reply(`Usage: ${prefix + command} nik|provinsi|kabupaten|nama|tempat, tanggal lahir|jenis kelamin|jalan|rt/rw|kelurahan|kecamatan|agama|status nikah|pekerjaan|warga negara|berlaku sampai|url_image\n\nExample: ${prefix + command} 456127893132123|bumipertiwi|fatamorgana|LoL Human|mars, 99-99-9999|belum ditemukan|jl wardoyo|999/999|turese|imtuni|alhamdulillah islam|jomblo kack|mikirin dia|indo ori no kw|hari kiamat|https://i.ibb.co/Xb2pZ88/test.jpg`)
                    get_args = args.join(" ").split("|")
                    nik = get_args[0]
                    prov = get_args[1]
                    kabu = get_args[2]
                    name = get_args[3]
                    ttl = get_args[4]
                    jk = get_args[5]
                    jl = get_args[6]
                    rtrw = get_args[7]
                    lurah = get_args[8]
                    camat = get_args[9]
                    agama = get_args[10]
                    nikah = get_args[11]
                    kerja = get_args[12]
                    warga = get_args[13]
                    until = get_args[14]
                    img = get_args[15]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/ktpmaker?apikey=${apikey}&nik=${nik}&prov=${prov}&kabu=${kabu}&name=${name}&ttl=${ttl}&jk=${jk}&jl=${jl}&rtrw=${rtrw}&lurah=${lurah}&camat=${camat}&agama=${agama}&nikah=${nikah}&kerja=${kerja}&warga=${warga}&until=${until}&img=${img}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break

                    // Converter
                case 'togif':
                    if ((isMedia && !lol.message.videoMessage || isQuotedSticker)) {
                        const encmedia = isQuotedSticker ? JSON.parse(JSON.stringify(lol).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : lol
                        filePath = await lolhuman.downloadAndSaveMediaMessage(encmedia, filename = getRandom());
                        file_name = getRandom(".gif")
                        ini_txt = args.join(" ").split("|")
                        request({
                            url: `http://api.lolhuman.xyz/api/convert/togif?apikey=${apikey}`,
                            method: 'POST',
                            formData: {
                                "img": fs.createReadStream(filePath),
                            },
                            encoding: "binary"
                        }, function(error, response, body) {
                            fs.unlinkSync(filePath)
                            fs.writeFileSync(file_name, body, "binary")
                            ini_buff = fs.readFileSync(file_name)
                            lolhuman.sendMessage(from, ini_buff, video, { quoted: lol, mimetype: "video/gif", filename: file_name })
                            fs.unlinkSync(file_name)
                        });
                    } else {
                        reply(`Kirim gambar dengan caption ${prefix + command} atau tag gambar yang sudah dikirim`)
                    }
                    break

                    // Other
                case 'ssweb':
                    if (args.length == 0) return reply(`Example: ${prefix + command} http://api.lolhuman.xyz`)
                    ini_link = args[0]
                    ini_buffer = await getBuffer(`http://lolhuman.herokuapp.com/api/ssweb?apikey=${apikey}&url=${ini_link}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'ssweb2':
                    if (args.length == 0) return reply(`Example: ${prefix + command} http://api.lolhuman.xyz`)
                    ini_link = args[0]
                    ini_buffer = await getBuffer(`http://lolhuman.herokuapp.com/api/sswebfull?apikey=${apikey}&url=${ini_link}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'shortlink':
                    if (args.length == 0) return reply(`Example: ${prefix + command} http://api.lolhuman.xyz`)
                    ini_link = args[0]
                    ini_buffer = await fetchJson(`http://lolhuman.herokuapp.com/api/shortlink?apikey=${apikey}&url=${ini_link}`)
                    reply(ini_buffer.result)
                    break
                case 'spamsms':
                    if (args.length == 0) return reply(`Example: ${prefix + command} 08303030303030`)
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
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/random/${command}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
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
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/random/nsfw/${command}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
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
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/random2/${command}?apikey=${apikey}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
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
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/textprome/${command}?apikey=${apikey}&text=${ini_txt}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'pornhub':
                case 'glitch':
                case 'avenger':
                case 'space':
                case 'ninjalogo':
                case 'marvelstudio':
                case 'lionlogo':
                case 'wolflogo':
                case 'steel3d':
                case 'wallgravity':
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    txt1 = args[0]
                    txt2 = args[1]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/textprome2/${command}?apikey=${apikey}&text1=${txt1}&text2=${txt2}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
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
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/photooxy1/${command}?apikey=${apikey}&text=${ini_txt}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                case 'tiktok':
                case 'arcade8bit':
                case 'battlefield4':
                case 'pubg':
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    txt1 = args[0]
                    txt2 = args[1]
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/photooxy2/${command}?apikey=${apikey}&text1=${txt1}&text2=${txt2}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
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
                    if (args.length == 0) return reply(`Example: ${prefix + command} LoL Human`)
                    ini_txt = args.join(" ")
                    ini_buffer = await getBuffer(`http://api.lolhuman.xyz/api/ephoto1/${command}?apikey=${apikey}&text=${ini_txt}`)
                    lolhuman.sendMessage(from, ini_buffer, image, { quoted: lol })
                    break
                default:
                    if (isCmd) {
                        reply(`Sorry bro, command *${prefix}${command}* gk ada di list *${prefix}help*`)
                    }
                    if (!isGroup && !isCmd) {
                        await lolhuman.updatePresence(from, Presence.composing)
                        simi = await fetchJson(`http://api.lolhuman.xyz/api/simi?apikey=${apikey}&text=${budy}`)
                        reply(simi.result)
                    }
            }
        } catch (e) {
            e = String(e)
            if (!e.includes("this.isZero")) {
                const time_error = moment.tz('Asia/Jakarta').format('HH:mm:ss')
                console.log(color(time_error, "white"), color("[  ERROR  ]", "aqua"), color(e, 'red'))
            }
        }
    })
}
starts()