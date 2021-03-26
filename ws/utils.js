const WebSocket = require('ws')
require('dotenv').config()
let ip = require('ip').address()
// get all ip addresses by node.js os module 
const nets = require('os').networkInterfaces()
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    if (net.family === 'IPv4' && !net.internal) {
      ip = net.address
    }
  }
}

const timestamp = function (date = 'time') {
  const now = new Date()
  const full = now.getFullYear() + '-' +
    ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
    ('0' + now.getDate()).slice(-2) + ' ' +
    ('0' + now.getHours()).slice(-2) + ':' +
    ('0' + now.getMinutes()).slice(-2) + ':' +
    ('0' + now.getSeconds()).slice(-2)
  if (date === 'full') {
    // e.g. 2021-03-14 16:03:00
    return full
  } else if (date === 'date') {
    return full.split(' ')[0]
  } else {
    // e.g. 16:03:00
    return full.split(' ')[1]
  }
}

const packMessage = function (text, opts = {}) {
  const args = {
    ...{
      type: 'remote',
      who: process.env.WEBSOCKET_ROBOT_NAME,
      date: timestamp('date'),
      time: timestamp('time'),
      message: text
    },
    ...opts
  }
  return JSON.stringify(args)
}

const userLastReadMessageId = (channel, userId) => {
  const MessageDB = require('./message-db.js')
  const channelDB = new MessageDB(channel)
  channelDB.replaceRead({
    $user_id: userId,
    $message_id: messageId
  })
  channelDB.close()
}

const markRead = (channel, userId, messageId) => {
  const MessageDB = require('./message-db.js')
  const channelDB = new MessageDB(channel)
  channelDB.replaceRead({
    $user_id: userId,
    $message_id: messageId
  })
  channelDB.close()
}

let broadcasting = false
const broadcast = (clients, row) => {
  const connected = clients.length
  if (broadcasting === false && connected > 0) {
    broadcasting = true
    const MessageDB = require('./message-db.js')
    const db = new MessageDB('announcement')
    let processed = 0
    clients.forEach(function each(client) {
      if (!client.user) {
        console.log('沒有使用者資訊，略過廣播此WS頻道 ... ')
        processed++
        if (processed == connected) {
          broadcasting = false
        }
        return
      }
      const userid = client.user.userid
      db.getLastReadId(userid, (err, readRow) => {
        err && console.warn(err)
        if (client.readyState === WebSocket.OPEN) {
          if (!readRow || readRow['message_id'] < row['id']) {
            const json = packMessage(row, { type: 'announcement' })
            client.send(json)
            // mark user has read for the message
            markRead('announcement', userid, row['id'])
          }
        }
        processed++
        if (processed == connected) {
          broadcasting = false
        }
      })
    })
  }
}

const trim = (x) => { return typeof x === 'string' ? x.replace(/^\s+|\s+$/gm,'') : '' }

module.exports.timestamp = timestamp
module.exports.packMessage = packMessage
module.exports.markRead = markRead
module.exports.broadcast = broadcast
module.exports.trim = trim
module.exports.ip = ip
