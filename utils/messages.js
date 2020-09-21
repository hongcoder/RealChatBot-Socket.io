const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a') //시간이랑 분 그리고 am인지 pm인지
  }
}

module.exports = formatMessage;