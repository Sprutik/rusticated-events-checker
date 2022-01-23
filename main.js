const fetch = require('node-fetch')
const fs = require('fs')
const telegramApi = require('node-telegram-bot-api')
const { eventOptions } = require('./options')

const token = '5063500242:AAEuSYHdJguIFyevBwhi0T6WFoJZW1hu6mI'
const bot = new telegramApi(token, { polling: true })

const rawdata = fs.readFileSync('users.json')
const users = JSON.parse(rawdata)

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Just start bot' },
    { command: '/subscribe', description: 'Subscribe on event' },
    { command: '/show_active_subscribtions', description: 'Show your active subscribtions' },
    { command: '/unsubscribe', description: 'Unsubscribe from ALL EVENTS' },
  ])

  bot.on('message', async (msg) => {
    const text = msg.text
    const username = msg.from.username
    const chatId = msg.chat.id

    switch (text) {
      case '/start':
        await bot.sendMessage(chatId, 'Welcome to checker bot!\nWrite /subscribe for subscribe on events')
        if (users.some((user) => user.chatId === chatId)) return
        users.push(new User(username, chatId))
        updateBD()
        break

      case '/subscribe':
        onSubscribe(chatId)
        break

      case '/unsubscribe':
        const user = users.find((user) => user.chatId === chatId)
        user.subscribes = []
        updateBD()
        await bot.sendMessage(user.chatId, 'Unsubscribe from All subscribtions')
        break

      case '/show_active_subscribtions':
        showActiveSubscribtions(chatId)
        break

      default:
        await bot.sendMessage(chatId, 'Non-existent command')
        break
    }
  })

  const keys = {
    name: null,
    event: null,
  }
  bot.on('callback_query', async (msg) => {
    const chatId = msg.from.id
    const data = JSON.parse(msg.data)

    switch (data.type) {
      case 'server':
        keys.name = data.name
        bot.deleteMessage(chatId, msg.message.message_id)
        await bot.sendMessage(chatId, `Choose event for ${data.name}:`, eventOptions)
        break

      case 'event':
        keys.event = data.event
        const user = users.find((user) => user.chatId === chatId)
        user?.subscribes.push({ name: keys.name, event: keys.event })
        updateBD()
        bot.deleteMessage(chatId, msg.message.message_id)
        await bot.sendMessage(chatId, `Added subscribe on ${keys.event} for  ${keys.name}`)
        break
    }
  })
}

async function showActiveSubscribtions(id) {
  const user = users.find((user) => user.chatId === id)
  console.log(user)
  if (user.subscribes.length === 0) {
    await bot.sendMessage(user.chatId, 'No active subscriptions')
  } else {
    for (let i = 0; i < user.subscribes.length; i++) {
      await bot.sendMessage(user.chatId, `${user.subscribes[i].event} for ${user.subscribes[i].name}`)
    }
  }
}

async function onSubscribe(chatId) {
  const servers = await getServers()

  const btns = {
    inline_keyboard: [[]],
  }

  let lineArr = []
  for (let i = 0; i < servers.length; i++) {
    if (lineArr.length === 3) {
      btns.inline_keyboard.push(lineArr)
      lineArr = []
    }

    lineArr.push({
      text: servers[Math.floor(i)].name,
      callback_data: JSON.stringify({
        type: 'server',
        name: servers[Math.floor(i)].name,
      }),
    })
  }
  btns.inline_keyboard.push(lineArr)

  const serverOptions = {
    reply_markup: JSON.stringify(btns),
  }

  await bot.sendMessage(chatId, 'Choose server:', serverOptions)
}

async function getServers() {
  return fetch('https://rusticated.com/api/v2/servers').then((res) => res.json())
}

function User(name, chatId) {
  this.username = name
  this.chatId = chatId
  this.subscribes = []
}

function updateBD() {
  const data = JSON.stringify(users)
  fs.writeFileSync('users.json', data)
}

start()

setInterval(async () => {
  const servers = await getServers()
  const date = Date.now()
  const timer = 30000

  for (let i = 0; i < servers.length; i++) {
    const events = servers[i].lastEvents

    if (date - Date.parse(events?.airdrop) < timer) {
      for (let userIndex = 0; userIndex < users.length; userIndex++) {
        if (
          users[userIndex].subscribes.findIndex(
            (obj) => obj.event === 'Air Drop' && obj.name === `${servers[i].name}`
          ) !== -1
        ) {
          await bot.sendMessage(users[userIndex].chatId, `AIR-DROP --- ${servers[i].name} `)
        }
      }
    }

    if (date - Date.parse(events?.cargoship) < timer) {
      for (let userIndex = 0; userIndex < users.length; userIndex++) {
        if (
          users[userIndex].subscribes.findIndex(
            (obj) => obj.event === 'Cargo Ship' && obj.name === `${servers[i].name}`
          ) !== -1
        ) {
          await bot.sendMessage(users[userIndex].chatId, `Cargo Ship --- ${servers[i].name} `)
        }
      }
    }

    if (date - Date.parse(events?.chinook) < timer) {
      for (let userIndex = 0; userIndex < users.length; userIndex++) {
        if (
          users[userIndex].subscribes.findIndex(
            (obj) => obj.event === 'Chinook' && obj.name === `${servers[i].name}`
          ) !== -1
        ) {
          await bot.sendMessage(users[userIndex].chatId, `Chinook --- ${servers[i].name} `)
        }
      }
    }

    if (date - Date.parse(events?.heli) < timer) {
      for (let userIndex = 0; userIndex < users.length; userIndex++) {
        if (
          users[userIndex].subscribes.findIndex((obj) => obj.event === 'Heli' && obj.name === `${servers[i].name}`) !==
          -1
        ) {
          await bot.sendMessage(users[userIndex].chatId, `Heli --- ${servers[i].name} `)
        }
      }
    }
  }
}, 5000)
