const initialise = (RED) => {
  'use strict'

  const safeJSONStringify = require('json-stringify-safe')

  function LogEcsLoggerNode (config) {
    const winston = require('winston')
    const { ecsFormat } = require('@elastic/ecs-winston-format')

    RED.nodes.createNode(this, config)
    this.logger = null

    // Console settings
    if (config.logconsole) {
      this.logger = new winston.createLogger({
        level: 'debug',
        transports: new winston.transports.Console(),
        format: ecsFormat(),
        exitOnError: false,
      })

      this.logger.on('error', (error) => {
        console.error('Error in logger caught', error)
      })

      this.debug('log-ecs logger created')
    }

    this.on('close', function (removed, done) {
      // close logger
      if (this.logger) {
        this.logger.close()
      }

      this.debug('log-ecs logger closed')

      if (done) done()
    })
  }

  RED.nodes.registerType('log-ecs-logger', LogEcsLoggerNode);

  LogEcsLoggerNode.prototype.addToLog = function addTolog (
    loglevel, msg, complete) {
    if (complete === true || complete === 'complete' || complete === 'true') {
      // Log complete message
      if (this.logger) {
        this.logger.log(loglevel, safeJSONStringify(msg), msg.meta)
      }
    } else if (complete !== undefined && complete !== null && complete !== '' &&
      complete !== false && complete !== 'false') {
      // Log part of message
      let output
      try { output = RED.util.getMessageProperty(msg, complete) } catch (err) {
        node.error(err)
        return
      }

      if (this.logger) {
        if (typeof output === 'string') {
          this.logger.log(loglevel, output, msg.meta)
        } else if (typeof output === 'object') {
          this.logger.log(loglevel, safeJSONStringify(output), msg.meta)
        } else {
          this.logger.log(loglevel, safeJSONStringify(output), msg.meta)
        }
      }
    }
  }
}
module.exports = initialise