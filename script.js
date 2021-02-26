/*
* Tambahin nama author lah
* Author MhankBarBar, Farhan
* Tambahin ya Cape Gan ngefix² Yg Ga work
* Jan numpang nama doank

- What's New?
* New Features
*/
// KALO NGUBAH YG TELITI NTAR GA WORK MALAH NYALAHIN HADEHH
// DAN YG NYURI TANPA KASIH CREDIT INGAT BRO LU SAMPAH🚮
const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange
} = require('@adiwajshing/baileys')

const fs = require("fs")
const axios = require('axios')
const request = require('request')
const moment = require('moment-timezone')

const { apikey, prefix } = JSON.parse(fs.readFileSync('./config.json'))

const { fetchJson } = require('./lib/fetcher')
const { color } = require('./lib/color')
const { help, bahasa, donate } = require('./help/help')

async function starts() {
    const lolhuman = new WAConnection()
    lolhuman.logger.level = 'warn'
    lolhuman.on('qr', () => {
        console.log(color('[', 'red'), color('!', 'yellow'), color(']', 'red'), color(' Scan the qr code above', 'green'))
    })

    fs.existsSync('./lolhuman.json') && lolhuman.loadAuthInfo('./lolhuman.json')
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

            const time = moment.tz('Asia/Jakarta').format('HH:mm:ss')

            pesan = lol.message.conversation
            body = (type === 'conversation' && pesan.startsWith(prefix)) ? pesan : (type == 'imageMessage') && lol.message.imageMessage.caption.startsWith(prefix) ? lol.message.imageMessage.caption : (type == 'videoMessage') && lol.message.videoMessage.caption.startsWith(prefix) ? lol.message.videoMessage.caption : (type == 'extendedTextMessage') && lol.message.extendedTextMessage.text.startsWith(prefix) ? lol.message.extendedTextMessage.text : ''
            budy = (type === 'conversation') ? pesan : (type === 'extendedTextMessage') ? lol.message.extendedTextMessage.text : ''
            var Link = (type === 'conversation' && pesan) ? pesan : (type == 'imageMessage') && lol.message.imageMessage.caption ? lol.message.imageMessage.caption : (type == 'videoMessage') && lol.message.videoMessage.caption ? lol.message.videoMessage.caption : (type == 'extendedTextMessage') && lol.message.extendedTextMessage.text ? lol.message.extendedTextMessage.text : ''
            const messagesLink = Link.slice(0).trim().split(/ +/).shift().toLowerCase()
            const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
            const args = body.trim().split(/ +/).slice(1)
            const argsjoin = args.join(' ')
            const isCmd = body.startsWith(prefix)
            lolhuman.chatRead(from)

            const botNumber = lolhuman.user.jid
            const isGroup = from.endsWith('@g.us')
            const sender = isGroup ? lol.participant : lol.key.remoteJid
            const groupMetadata = isGroup ? await lolhuman.groupMetadata(from) : ''
            const groupName = isGroup ? groupMetadata.subject : ''
            const totalchat = await lolhuman.chats.all()

            const isUrl = (url) => {
                return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
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

            if (!isGroup && !isCmd) console.log(color(time, "white"), color("[ PRIVATE ]", "aqua"), pesan, "from", color(sender.split('@')[0], "yellow"))
            if (isGroup && !isCmd) console.log(color(time, "white"), color("[  GROUP  ]", "aqua"), pesan, "from", color(sender.split('@')[0], "yellow"), "in", color(groupName, "yellow"))
            if (isGroup && isCmd) console.log(color(time, "white"), color("[ COMMAND ]", "aqua"), pesan, "from", color(sender.split('@')[0], "yellow"), "in", color(groupName, "yellow"))
            if (isCmd) console.log(color(time, "white"), color("[ COMMAND ]", "aqua"), pesan, "from", color(sender.split('@')[0], "yellow"))

            switch (command) {
                case 'help':
                    reply(help(prefix))
                    break
                case 'donate':
                    reply(donate(pushname2))
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
                    console.log(txt)
                    reply(txt)
                    break
                default:
                    if (body.startsWith(`${prefix}${command}`)) {
                        reply(`Sorry bro, command *${prefix}${command}* gk enek nggon list *${prefix}help*`)
                    }
                    if (!isGroup) {
                        simi = await fetchJson(`http://api.lolhuman.xyz/api/simi?apikey=${apikey}&text=${pesan}`)
                        reply(simi.result)
                    }
            }
        } catch (e) {
            console.log('Error : %s', color(e, 'white'))
        }
    })
}
starts()