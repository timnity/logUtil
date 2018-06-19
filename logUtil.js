const path = require('path')
const fs = require('fs')

const shelljs = require('shelljs')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf, colorize } = format
require('winston-daily-rotate-file')


function getLogger(logLevel) {
  const logDirectory = path.join(__dirname, './logs')

  // 判断日志文件夹存在不存在，不存在则创建
  try {
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory)
    }

    const infoLogDir = path.join(logDirectory, '/info')
    if (!fs.existsSync(infoLogDir)) {
      shelljs.mkdir('-p', infoLogDir)
    }

    const warnLogDir = path.join(logDirectory, '/warn')
    if (!fs.existsSync(warnLogDir)) {
      shelljs.mkdir('-p', warnLogDir)
    }

    const errorLogDir = path.join(logDirectory, '/error')
    if (!fs.existsSync(errorLogDir)) {
      shelljs.mkdir('-p', errorLogDir)
    }
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.log(`Could not set up log directory, error was ${error}`)
      process.exit(1)
    }
  }

  // 格式化日志输出
  const tsFormat = () => (new Date()).toLocaleTimeString()

  const myFormat = printf(msg => {
    return `${msg.timestamp} [${msg.label}] ${msg.level}: ${msg.message}`
  })


  /**
   * 初始化winston,日志分为5级,从高到低为
   * error | warn | info | verbose | debug | silly
   */
  const logger = createLogger({
    format: combine(
      // colorize(),
      label({ label: `${logLevel}` }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      myFormat
    ),
    transports: [
      new transports.Console(),
      new transports.DailyRotateFile({
        filename: `${logDirectory}/${logLevel}/%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: '14d'
      })
    ]
  })

  return logger
}


/**
 * 打印到不同日志文件中
 */
exports.info = (content) => {
  getLogger('info').info(content)
}

exports.warn = (content) => {
  getLogger('warn').warn(content)
}

exports.error = (content) => {
  getLogger('error').error(content)
}
