# LoL Human Case Rest API WA Bot

WhatsApp bot built on [`Baileys`](https://github.com/WhiskeySockets/Baileys) (multi-device) with 500+ commands powered by [`LoL Human Rest API`](https://api.lolhuman.xyz/).

# Requirements
* Node.js 20 or newer
* ffmpeg (used for stickers and GIF/video conversion)
* A LoL Human API key

# Installation

## Termux
```cmd
> pkg update && pkg upgrade
> pkg install git -y
> pkg install nodejs -y
> pkg install ffmpeg -y
```

## Windows
* [`Download ffmpeg`](https://ffmpeg.org/download.html#build-windows) and set path
* [`Download wget`](https://eternallybored.org/misc/wget/releases/) and set path
* [`Download Node JS`](https://nodejs.org/en/download/)

## Cloning this repo
```cmd
> git clone https://github.com/LoL-Human/Case-WA-Bot.git
> cd Case-WA-Bot
```

## Install the package
```cmd
> npm i
```

## Edit config file
Edit the required value in `config.json`. You can get the api key at [`LoL Human Rest API`](https://api.lolhuman.xyz/).
```json
{
    "apikey": "",
    "prefix": "/",
    "owner": "62895418200111"
}
```
* `apikey`: your LoL Human API key. The bot exits on start if it is empty.
* `prefix`: character that starts a command.
* `owner`: owner number in international format without `+`. Owner-only commands: `broadcast`, `hidetag`, `tagstick`, `clearall`, `checkapikey`.

To keep your API key out of commits, tell git to ignore local changes to the file:
```cmd
> git update-index --skip-worktree config.json
```

## Run the bot
```cmd
> npm start
```
Scan the QR code shown in the terminal from WhatsApp (**Linked devices**). The login session is stored in the `session/` folder; delete it to log in with another number.

# Usage
* Send `/help` to the bot to see every command.
* Commands with one parameter take the rest of the message: `/ytchannel jess no limit`
* Commands with several parameters split them with `|`: `/juventusshirt LoLHuman|99`
* Image commands: send an image with the command as caption, or reply to an image. Commands marked `(url gambar)` need an image link instead. With no image, the bot uses the profile picture of the mentioned user or the sender.
* Quiz commands (`/tebakkata`, `/tebakfamily100`, ...) reveal the answer after 60 seconds.
* Commands marked `(premium)` need a premium / VIP API key.
* In private chat, messages that are not commands get a reply from SimSimi.

# Project Structure
| Path | Description |
| --- | --- |
| `index.js` | Starts `script.js` as a child process |
| `script.js` | Connection, message handling, and the hand-written cases |
| `help/help.js` | Help menu |
| `lib/compat.js` | Old Baileys v3 style API (`sendMessage(jid, content, MessageType.x)`) on top of Baileys v7 |
| `lib/lolhuman-features.js` | Table of the generated commands (endpoint and parameters) |
| `lib/lolhuman-runner.js` | Runs a command from that table and replies based on the response type |
| `database/` | JSON storage for AFK and games |

## Adding a command
For a simple endpoint, add one row to `lib/lolhuman-features.js`. It shows up in `/help` automatically:
```js
{ cmd: 'zodiak', cat: 'Primbon', path: '/api/zodiak/{name}', inputs: [{ name: 'name', kind: 'text', loc: 'path', example: 'leo' }] },
```
* `path`: endpoint, `{name}` is replaced by a path input.
* `inputs[].kind`: `text` (from the message), `image` / `file` (from media), `fixed` (always `example`), `sender` (sender number).
* `inputs[].loc`: `path` or `query`.
* Optional flags: `post: true` (upload media as multipart), `premium`, `game`, `ownerOnly`.

For custom behaviour, add a `case` in `script.js`. Hand-written cases take priority over the table.

# Available Case

<details>
<summary><b>General</b> (8)</summary>

* `/help`
* `/donate`
* `/sticker`
* `/stickerwm`
* `/broadcast`
* `/hidetag`
* `/tagstick`
* `/clearall`

</details>

<details>
<summary><b>Islami</b> (11)</summary>

* `/listsurah`
* `/asmaulhusna`
* `/alquran no_surah`
* `/alquran no_surah/no_ayat`
* `/alquran no_surah/no_ayat1-no_ayat2`
* `/alquranaudio no_surah`
* `/alquranaudio no_surah/no_ayat`
* `/kisahnabi nama_nabi`
* `/jadwalsholat daerah`
* `/hadits kitab|id`
* `/niatsholat sholat`

</details>

<details>
<summary><b>Downloader</b> (26)</summary>

* `/ytsearch query`
* `/ytplay query`
* `/ytmp3 url_video`
* `/ytmp4 url_video`
* `/tiktoknowm url_video`
* `/tiktokmusic url_video`
* `/igdl url_post`
* `/fbdl url_video`
* `/jooxplay query`
* `/spotify url_music`
* `/spotifysearch query`
* `/pinterest query`
* `/pinterestdl url_pinterest`
* `/pixiv query`
* `/pixivdl url_pixiv`
* `/zippyshare url_zippyshare`
* `/telesticker url_pack`
* `/apkdownloader package`
* `/ighashtag query`
* `/igstory username`
* `/linestick url`
* `/smule url`
* `/snackvideo url`
* `/soundcloud url`
* `/tiktok2 url` (premium)
* `/tiktokwm url`

</details>

<details>
<summary><b>Movie & Story</b> (7)</summary>

* `/drakorongoing`
* `/lk21 query`
* `/wattpad url_wattpad`
* `/wattpadsearch query`
* `/cerpen`
* `/ceritahoror`
* `/filmapik query`

</details>

<details>
<summary><b>Searching</b> (18)</summary>

* `/shopee query`
* `/google query`
* `/gimage query`
* `/gimage2 query`
* `/konachan query`
* `/playstore query`
* `/stickerwa query`
* `/wallpapersearch query`
* `/wallpapersearch2 query`
* `/domainsearch query`
* `/googlereverse (kirim/reply gambar)`
* `/groupwhatsapp query`
* `/moddroid query`
* `/musicsearch (kirim/reply gambar)` (premium)
* `/reverseyandex (url gambar)`
* `/searchbijak query`
* `/searchplace query`
* `/unsplash query`

</details>

<details>
<summary><b>Random Text</b> (13)</summary>

* `/quotes`
* `/quotesdilan`
* `/quotesanime`
* `/quotesimage`
* `/faktaunik`
* `/katabijak`
* `/pantun`
* `/bucin`
* `/randomnama`
* `/katabucin`
* `/people`
* `/puisi`
* `/quotesislami`

</details>

<details>
<summary><b>AniManga</b> (16)</summary>

* `/wait`
* `/manga query`
* `/anime query`
* `/character query`
* `/kusonime url_kusonime`
* `/kusonimesearch query`
* `/otakudesu url_otakudesu`
* `/otakudesusearch query`
* `/nhentai kode_bom`
* `/nhentaipdf kode_bom`
* `/nhentaisearch query`
* `/nekopoi url`
* `/nekopoisearch query`
* `/kusonimesearch2 query`
* `/neonimelatest`
* `/wmit (kirim/reply gambar)`

</details>

<details>
<summary><b>Information</b> (34)</summary>

* `/kbbi`
* `/brainly2`
* `/jarak`
* `/urbandictionary`
* `/jadwaltv channel`
* `/jadwaltvnow`
* `/jadwalbola`
* `/qrreader`
* `/heroml hero_name`
* `/mlstalk id/server`
* `/genshin character`
* `/wikipedia query`
* `/translate kode_negara text`
* `/brainly query`
* `/newsinfo`
* `/cnnindonesia`
* `/cnnnasional`
* `/cnninternasional`
* `/infogempa`
* `/lirik query`
* `/cuaca daerah`
* `/kodepos query`
* `/indbeasiswa`
* `/hoax`
* `/nsfwcheck`
* `/ocr`
* `/agedetect (kirim/reply gambar)` (premium)
* `/countdown tanggal|bulan|tahun`
* `/cuaca2 latitude|longitude`
* `/facedetect (kirim/reply gambar)` (premium)
* `/gsmarenadetail url`
* `/superhero query`
* `/travelroute from|to`
* `/urdict query`

</details>

<details>
<summary><b>Entertainment</b> (26)</summary>

* `/asupan`
* `/wancak`
* `/tebakgambar`
* `/canceltebakgambar`
* `/akinator`
* `/cancelakinator`
* `/alay text`
* `/bahasapurba text`
* `/hilih text`
* `/ninja nama`
* `/openai text` (premium)
* `/openaiturbo text|system` (premium)
* `/tebakasahotak`
* `/tebakbendera`
* `/tebakcaklontong`
* `/tebakcaklontong2`
* `/tebakchara`
* `/tebakfamily100`
* `/tebakgambar2`
* `/tebakjenaka`
* `/tebakkata`
* `/tebaklirik`
* `/tebaksiapaaku`
* `/tebaksusunkata`
* `/tebakunsurkimia`
* `/upperlower text`

</details>

<details>
<summary><b>Creator</b> (22)</summary>

* `/ttp text`
* `/ttp2 text`
* `/ttp3 text`
* `/ttp4 text`
* `/attp text`
* `/smoji emoji`
* `/fakedonald text`
* `/ktpmaker`
* `/amongus text`
* `/attp2 text`
* `/burningfire (url gambar)`
* `/carbon code`
* `/dalle text` (premium)
* `/diffusionprompt prompt` (premium)
* `/gtapassed text1|text2`
* `/gtts code|text`
* `/phcomment text|username (url gambar)`
* `/qrcode text`
* `/rank username|level|ranking|currxp|xpneed (url gambar)`
* `/ttp5 text`
* `/ttp6 text`
* `/ytcomment username|comment (url gambar)`

</details>

<details>
<summary><b>Primbon</b> (7)</summary>

* `/artinama name`
* `/jodoh name1 & name2 `
* `/weton tanggal bulan tahun`
* `/jadian tanggal bulan tahun`
* `/tebakumur name`
* `/tebakgender name`
* `/zodiak name`

</details>

<details>
<summary><b>Other</b> (9)</summary>

* `/ssweb link`
* `/ssweb2 link`
* `/shortlink link`
* `/spamsms nomor`
* `/mirrorcreator url`
* `/resoomer text`
* `/shortlink2 url`
* `/shortlink3 url`
* `/shortlink4 url`

</details>

<details>
<summary><b>Text Pro Me</b> (49)</summary>

* `/blackpink text`
* `/neon text`
* `/greenneon text`
* `/advanceglow text`
* `/futureneon text`
* `/sandwriting text`
* `/sandsummer text`
* `/sandengraved text`
* `/metaldark text`
* `/neonlight text`
* `/holographic text`
* `/text1917 text`
* `/minion text`
* `/deluxesilver text`
* `/newyearcard text`
* `/bloodfrosted text`
* `/halloween text`
* `/jokerlogo text`
* `/fireworksparkle text`
* `/natureleaves text`
* `/bokeh text`
* `/toxic text`
* `/strawberry text`
* `/box3d text`
* `/roadwarning text`
* `/breakwall text`
* `/icecold text`
* `/luxury text`
* `/cloud text`
* `/summersand text`
* `/horrorblood text`
* `/thunder text`
* `/pornhub text1 text2`
* `/glitch text1 text2`
* `/avenger text1 text2`
* `/space text1 text2`
* `/ninjalogo text1 text2`
* `/marvelstudio text1 text2`
* `/lionlogo text1 text2`
* `/wolflogo text1 text2`
* `/steel3d text1 text2`
* `/wallgravity text1 text2`
* `/coolgravity text1|text2`
* `/harrypotter2 text`
* `/impressiveglitch text`
* `/magma text`
* `/sliced text`
* `/watercolor2 text`
* `/wonderfulgraffiti text`

</details>

<details>
<summary><b>Photo Oxy</b> (29)</summary>

* `/shadow text`
* `/cup text`
* `/cup1 text`
* `/romance text`
* `/smoke text`
* `/burnpaper text`
* `/lovemessage text`
* `/undergrass text`
* `/love text`
* `/coffe text`
* `/woodheart text`
* `/woodenboard text`
* `/summer3d text`
* `/wolfmetal text`
* `/nature3d text`
* `/underwater text`
* `/golderrose text`
* `/summernature text`
* `/letterleaves text`
* `/glowingneon text`
* `/fallleaves text`
* `/flamming text`
* `/harrypotter text`
* `/carvedwood text`
* `/tiktok text1 text2`
* `/arcade8bit text1 text2`
* `/battlefield4 text1 text2`
* `/pubg text1 text2`
* `/bannerlol text`

</details>

<details>
<summary><b>Ephoto 360</b> (45)</summary>

* `/wetglass text`
* `/multicolor3d text`
* `/watercolor text`
* `/luxurygold text`
* `/galaxywallpaper text`
* `/lighttext text`
* `/beautifulflower text`
* `/puppycute text`
* `/royaltext text`
* `/heartshaped text`
* `/birthdaycake text`
* `/galaxystyle text`
* `/hologram3d text`
* `/greenneon text`
* `/glossychrome text`
* `/greenbush text`
* `/metallogo text`
* `/noeltext text`
* `/glittergold text`
* `/textcake text`
* `/starsnight text`
* `/wooden3d text`
* `/textbyname text`
* `/writegalacy text`
* `/galaxybat text`
* `/snow3d text`
* `/birthdayday text`
* `/goldplaybutton text`
* `/silverplaybutton text`
* `/freefire text`
* `/anonymhacker text`
* `/aovwall text`
* `/avatardota text`
* `/avatarlolnew text`
* `/cartoongravity text`
* `/codwarzone text1|text2`
* `/cutegravity text1|text2`
* `/fpslogo text`
* `/juventusshirt text1|text2`
* `/logogaming text`
* `/lolbanner text`
* `/mlwall text`
* `/pubgmaskot text`
* `/realvintage text1|text2`
* `/valorantbanner text1|text2|text3`

</details>

<details>
<summary><b>Random Image</b> (119)</summary>

* `/art`
* `/bts`
* `/exo`
* `/elf`
* `/loli`
* `/neko`
* `/waifu`
* `/shota`
* `/husbu`
* `/sagiri`
* `/shinobu`
* `/megumin`
* `/wallnime`
* `/chiisaihentai`
* `/trap`
* `/blowjob`
* `/yaoi`
* `/ecchi`
* `/hentai`
* `/ahegao`
* `/hololewd`
* `/sideoppai`
* `/animefeets`
* `/animebooty`
* `/animethighss`
* `/hentaiparadise`
* `/animearmpits`
* `/hentaifemdom`
* `/lewdanimegirls`
* `/biganimetiddies`
* `/animebellybutton`
* `/hentai4everyone`
* `/bj`
* `/ero`
* `/cum`
* `/feet`
* `/yuri`
* `/trap`
* `/lewd`
* `/feed`
* `/eron`
* `/solo`
* `/gasm`
* `/poke`
* `/anal`
* `/holo`
* `/tits`
* `/kuni`
* `/kiss`
* `/erok`
* `/smug`
* `/baka`
* `/solog`
* `/feetg`
* `/lewdk`
* `/waifu`
* `/pussy`
* `/femdom`
* `/cuddle`
* `/hentai`
* `/eroyuri`
* `/cum_jpg`
* `/blowjob`
* `/erofeet`
* `/holoero`
* `/classic`
* `/erokemo`
* `/fox_girl`
* `/futanari`
* `/lewdkemo`
* `/wallpaper`
* `/pussy_jpg`
* `/kemonomimi`
* `/nsfw_avatar`
* `/ngif`
* `/nsfw_neko_gif`
* `/random_hentai_gif`
* `/anjing`
* `/awoo`
* `/bite`
* `/blackpink2`
* `/blush`
* `/bonk`
* `/bully`
* `/cogan`
* `/cringe`
* `/cry`
* `/dance`
* `/elaina`
* `/estetic`
* `/gawrgura`
* `/glomp`
* `/handhold`
* `/happy`
* `/highfive`
* `/hug`
* `/kanna`
* `/kick`
* `/kill`
* `/lick`
* `/neko2`
* `/ngif`
* `/nom`
* `/pat`
* `/ppcouple`
* `/sfwcuddle`
* `/sfwkiss`
* `/sfwmegumin`
* `/sfwneko`
* `/sfwpoke`
* `/sfwshinobu`
* `/sfwsmug`
* `/sfwwaifu`
* `/slap`
* `/smile`
* `/tickle`
* `/wave`
* `/wink`
* `/yeet`

</details>

<details>
<summary><b>Checker</b> (2)</summary>

* `/checkapikey`
* `/domaincheck query`

</details>

<details>
<summary><b>Converter</b> (12)</summary>

* `/convert2pdf (kirim/reply gambar)` (premium)
* `/emojimix combo`
* `/filetobase64 (kirim/reply gambar)`
* `/hextostr hex`
* `/imgtopdf (kirim/reply gambar)`
* `/morsedecrypt text`
* `/morseencrypt text`
* `/strtohex text`
* `/togif2 (kirim/reply gambar)`
* `/topng (kirim/reply gambar)`
* `/urltoimg url`
* `/webptogif (kirim/reply gambar)`

</details>

<details>
<summary><b>Education</b> (1)</summary>

* `/roboguru query|grade|subject`

</details>

<details>
<summary><b>Game</b> (6)</summary>

* `/codm user_id`
* `/genshinid user_id`
* `/growiki query`
* `/growtopia`
* `/minecraft server`
* `/sausageman user_id`

</details>

<details>
<summary><b>Image Processing</b> (25)</summary>

* `/affect (kirim/reply gambar)`
* `/beautiful (kirim/reply gambar)`
* `/bed (kirim/reply gambar)`
* `/bubblechat name|text (url gambar)`
* `/cartoon (kirim/reply gambar)`
* `/deepfry (kirim/reply gambar)`
* `/fisheye (kirim/reply gambar)`
* `/flip (kirim/reply gambar)`
* `/grayscale (kirim/reply gambar)`
* `/hitler (kirim/reply gambar)`
* `/imagecolor hex (kirim/reply gambar)`
* `/invert (kirim/reply gambar)`
* `/jail (kirim/reply gambar)`
* `/jokeoverhead (kirim/reply gambar)`
* `/kissimg (kirim/reply gambar)`
* `/pixelate (kirim/reply gambar)`
* `/rainbow (kirim/reply gambar)`
* `/rotate rotate (kirim/reply gambar)`
* `/roundimage (kirim/reply gambar)`
* `/sepia (kirim/reply gambar)`
* `/skullmask (kirim/reply gambar)`
* `/spank (kirim/reply gambar)`
* `/trash (kirim/reply gambar)`
* `/upscale (kirim/reply gambar)` (premium)
* `/wanted (kirim/reply gambar)`

</details>

<details>
<summary><b>Meme</b> (8)</summary>

* `/changemymind text`
* `/darkjoke`
* `/kannagen text`
* `/meme`
* `/memegen texttop|textbottom (url gambar)`
* `/memeindo`
* `/ohno text`
* `/stickermeme texttop|textbottom (url gambar)`

</details>

<details>
<summary><b>News</b> (10)</summary>

* `/cnnekonomi`
* `/cnnhiburan`
* `/cnnolahraga`
* `/cnnsocial`
* `/cnnteknologi`
* `/detik`
* `/jalantikus`
* `/kumparan`
* `/liputan6`
* `/republika`

</details>

<details>
<summary><b>Stalking</b> (2)</summary>

* `/ipaddress ip`
* `/ytchannel query`

</details>

## Note:
* You can request a case in my [`WhatsApp`](http://wa.me/62895418200111).

# Thanks To
* [`Baileys`](https://github.com/WhiskeySockets/Baileys)
* [`Fxc7`](https://github.com/Fxc7)
* [`Pais`](https://github.com/Paiiss)
* [`MhankBarBar`](https://github.com/MhankBarBar)
* [`Lindow`](https://github.com/lindow666)
* [`Mat`](https://github.com/mamet8)
* [`Riyan`](https://github.com/shitara999)
* [`Sofyan`](https://github.com/SofyanAMV09)
* [`Riz`](https://github.com/riznih)
* [`Paul`]