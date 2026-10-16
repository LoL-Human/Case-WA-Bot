// Compatibility layer: exposes the old @adiwajshing/baileys v3 API (WAConnection,
// MessageType, sendMessage(jid, content, type, options), ...) on top of the
// current multi-device `baileys` socket, so script.js can stay mostly unchanged.
const EventEmitter = require('events')
const fs = require('fs')
const pino = require('pino')
const qrcode = require('qrcode-terminal')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    downloadContentFromMessage,
    jidNormalizedUser,
    getContentType,
    normalizeMessageContent,
    Browsers
} = require('baileys')

const MessageType = {
    text: 'conversation',
    extendedText: 'extendedTextMessage',
    contact: 'contactMessage',
    location: 'locationMessage',
    liveLocation: 'liveLocationMessage',
    image: 'imageMessage',
    video: 'videoMessage',
    sticker: 'stickerMessage',
    document: 'documentMessage',
    audio: 'audioMessage',
    product: 'productMessage'
}

const Mimetype = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    mp4: 'video/mp4',
    gif: 'video/gif',
    pdf: 'application/pdf',
    ogg: 'audio/ogg; codecs=opus',
    mp4Audio: 'audio/mp4',
    webp: 'image/webp'
}

const Presence = {
    available: 'available',
    unavailable: 'unavailable',
    composing: 'composing',
    recording: 'recording',
    paused: 'paused'
}

const GroupSettingChange = {
    messageSend: 'announcement',
    settingsChange: 'locked'
}

// script.js deep-clones messages with JSON.stringify, which turns Uint8Array
// fields (mediaKey, thumbnails, ...) into {"0":..,"1":..} objects. Turn them back.
function revive(obj) {
    if (obj == null || typeof obj !== 'object' || Buffer.isBuffer(obj) || obj instanceof Uint8Array) return obj
    if (Array.isArray(obj)) return obj.map(revive)
    if (obj.type === 'Buffer' && Array.isArray(obj.data)) return Buffer.from(obj.data)
    const keys = Object.keys(obj)
    if (keys.length > 0 && keys.every((k, i) => k === String(i)) && keys.every(k => typeof obj[k] === 'number')) {
        return Buffer.from(keys.map(k => obj[k]))
    }
    const out = {}
    for (const k of keys) out[k] = revive(obj[k])
    return out
}

const toMedia = content => typeof content === 'string' ? { url: content } : content

class WAConnection extends EventEmitter {
    constructor() {
        super()
        this.logger = pino({ level: 'warn' })
        this.authFolder = './session'
        this.contacts = {}
        this.user = null
        this.sock = null
        this._chats = new Map()
        this._groupCache = new Map()
        this.chats = { all: () => [...this._chats.values()] }
    }

    connect() {
        return new Promise((resolve, reject) => this._start(resolve, reject))
    }

    async _start(resolve, reject) {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(this.authFolder)
            const { version } = await fetchLatestBaileysVersion().catch(() => ({}))
            this.emit('connecting')
            const sock = makeWASocket({
                version,
                auth: state,
                logger: this.logger,
                browser: Browsers.ubuntu('Chrome'),
                markOnlineOnConnect: false
            })
            this.sock = sock

            sock.ev.on('creds.update', saveCreds)

            sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
                if (qr) {
                    this.emit('qr', qr)
                    qrcode.generate(qr, { small: true })
                }
                if (connection === 'open') {
                    this.user = { ...sock.user, jid: jidNormalizedUser(sock.user.id) }
                    this.emit('open')
                    sock.groupFetchAllParticipating()
                        .then(groups => Object.keys(groups).forEach(jid => this._trackChat(jid)))
                        .catch(() => {})
                    resolve && resolve()
                    resolve = null
                }
                if (connection === 'close') {
                    const code = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode
                    if (code === DisconnectReason.loggedOut) {
                        console.log(`Logged out. Delete the "${this.authFolder}" folder and restart to scan a new QR.`)
                        this.emit('close', { reason: 'logged out' })
                        return
                    }
                    this.emit('close', { reason: code })
                    this._start(resolve, reject)
                }
            })

            sock.ev.on('messages.upsert', ({ messages, type }) => {
                if (type !== 'notify') return
                for (const msg of messages) {
                    if (!msg.message) continue
                    msg.message = normalizeMessageContent(msg.message)
                    const jid = msg.key.remoteJid
                    const senderPn = msg.key.participantAlt || msg.key.participant
                    if (senderPn) msg.participant = senderPn
                    const senderJid = msg.key.fromMe ? null : (senderPn || msg.key.remoteJidAlt || jid)
                    if (senderJid && msg.pushName) {
                        this.contacts[senderJid] = { ...(this.contacts[senderJid] || {}), jid: senderJid, notify: msg.pushName }
                    }
                    this._trackChat(jid, msg)
                    this.emit('chat-update', { jid, hasNewMessage: true, messages: [msg] })
                }
            })

            const saveContacts = list => {
                for (const c of list) {
                    if (!c.id) continue
                    const prev = this.contacts[c.id] || {}
                    this.contacts[c.id] = { ...prev, jid: c.id, notify: c.notify || c.name || prev.notify, vname: c.verifiedName || prev.vname }
                }
            }
            sock.ev.on('contacts.upsert', saveContacts)
            sock.ev.on('contacts.update', saveContacts)

            sock.ev.on('group-participants.update', ({ id, participants, action }) => {
                this._groupCache.delete(id)
                const jids = (participants || []).map(p => typeof p === 'string' ? p : (p.phoneNumber || p.id))
                this.emit('group-participants-update', { jid: id, participants: jids, action })
            })
        } catch (e) {
            if (reject) reject(e)
            else console.error(e)
        }
    }

    _trackChat(jid, msg) {
        if (!jid || jid === 'status@broadcast') return
        const chat = this._chats.get(jid) || { jid }
        if (msg) chat.lastMessage = { key: msg.key, messageTimestamp: msg.messageTimestamp }
        this._chats.set(jid, chat)
    }

    async sendMessage(jid, content, type, options = {}) {
        options = { ...options }
        let message
        switch (type) {
            case MessageType.text:
            case MessageType.extendedText:
                if (content && typeof content === 'object') {
                    const { text, quoted, contextInfo, ...rest } = content
                    message = { text: String(text), ...rest }
                    if (contextInfo) options.contextInfo = { ...contextInfo, ...(options.contextInfo || {}) }
                    if (quoted && !options.quoted) options.quoted = quoted
                } else {
                    message = { text: String(content) }
                }
                break
            case MessageType.image:
                message = { image: toMedia(content) }
                break
            case MessageType.video:
                message = { video: toMedia(content) }
                if (options.mimetype === Mimetype.gif) {
                    message.gifPlayback = true
                    options.mimetype = Mimetype.mp4
                }
                break
            case MessageType.sticker:
                message = { sticker: toMedia(content) }
                break
            case MessageType.audio:
                message = { audio: toMedia(content), mimetype: options.mimetype || Mimetype.mp4Audio, ptt: !!options.ptt }
                break
            case MessageType.document:
                message = { document: toMedia(content), mimetype: options.mimetype || 'application/octet-stream', fileName: options.filename || 'file' }
                break
            case MessageType.location:
            case MessageType.liveLocation:
                message = { location: content }
                break
            case MessageType.contact:
                message = { contacts: { displayName: content.displayname || content.displayName, contacts: [{ vcard: content.vcard }] } }
                break
            default:
                message = content
        }
        if (options.caption != null && ('image' in message || 'video' in message || 'document' in message)) message.caption = options.caption
        if (options.mimetype && ('image' in message || 'video' in message)) message.mimetype = options.mimetype
        if (options.contextInfo) {
            const contextInfo = revive(options.contextInfo)
            if (contextInfo.mentionedJid) message.mentions = contextInfo.mentionedJid
            message.contextInfo = contextInfo
        }
        const quoted = options.quoted ? revive(options.quoted) : undefined
        return this.sock.sendMessage(jid, message, { quoted })
    }

    async downloadMediaMessage(m) {
        const msg = normalizeMessageContent(revive(m).message)
        const type = getContentType(msg)
        if (!type || !/Message$/.test(type)) throw new Error('Message has no media')
        const stream = await downloadContentFromMessage(msg[type], type.replace(/Message$/, ''))
        const chunks = []
        for await (const chunk of stream) chunks.push(chunk)
        return Buffer.concat(chunks)
    }

    async downloadAndSaveMediaMessage(m, filename = 'undefined') {
        const msg = normalizeMessageContent(revive(m).message)
        const type = getContentType(msg)
        const buffer = await this.downloadMediaMessage(m)
        const mimetype = (msg[type] && msg[type].mimetype) || 'application/octet-stream'
        const ext = mimetype.split('/')[1].split(';')[0]
        const filePath = `${filename}.${ext}`
        await fs.promises.writeFile(filePath, buffer)
        return filePath
    }

    getProfilePicture(jid) {
        return this.sock.profilePictureUrl(jid, 'image')
    }

    async groupMetadata(jid) {
        const cached = this._groupCache.get(jid)
        if (cached && Date.now() - cached.at < 60 * 1000) return cached.data
        const meta = await this.sock.groupMetadata(jid)
        meta.participants = meta.participants.map(p => ({
            ...p,
            jid: p.phoneNumber || p.id,
            isAdmin: !!p.admin,
            isSuperAdmin: p.admin === 'superadmin'
        }))
        this._groupCache.set(jid, { at: Date.now(), data: meta })
        return meta
    }

    chatRead(jid) {
        const chat = this._chats.get(jid)
        if (!chat || !chat.lastMessage) return Promise.resolve()
        return this.sock.readMessages([chat.lastMessage.key]).catch(() => {})
    }

    async modifyChat(jid, action) {
        if (action !== 'delete') return
        const chat = this._chats.get(jid)
        if (!chat || !chat.lastMessage) return
        await this.sock.chatModify({ delete: true, lastMessages: [chat.lastMessage] }, jid).catch(() => {})
        this._chats.delete(jid)
    }

    updatePresence(jid, presence) {
        return this.sock.sendPresenceUpdate(presence, jid)
    }
}

module.exports = { WAConnection, MessageType, Mimetype, Presence, GroupSettingChange }
