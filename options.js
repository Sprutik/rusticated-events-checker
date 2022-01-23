module.exports = {
  eventOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: 'Air Drop',
            callback_data: JSON.stringify({ type: 'event', event: 'Air Drop' }),
          },
        ],
        [
          {
            text: 'Cargo Ship',
            callback_data: JSON.stringify({ type: 'event', event: 'Cargo Ship' }),
          },
        ],
        [
          {
            text: 'Heli',
            callback_data: JSON.stringify({ type: 'event', event: 'Heli' }),
          },
        ],
        [
          {
            text: 'Chinook',
            callback_data: JSON.stringify({ type: 'event', event: 'Chinook' }),
          },
        ],
      ],
    }),
  },
}
