var Long = require('long');

exports.format = function (message) {
  switch (message.messageType) {
  case 'V':
    return formatVersion(message);
  case 'S':
    return formatSeconds(message);
  case 'A':
    return formatOrderAdded(message);
  case 'E':
    return formatOrderExecuted(message);
  case 'X':
    return formatOrderCanceled(message);
  case 'D':
    return formatOrderDeleted(message);
  case 'B':
    return formatBrokenTrade(message);
  default:
    throw new Error('Unknown message type: ' + message.messageType);
  }
}

exports.parse = function (buffer) {
  var messageType = buffer.readUInt8();

  switch (messageType) {
  case 0x56:
    return parseVersion(buffer);
  case 0x53:
    return parseSeconds(buffer);
  case 0x41:
    return parseOrderAdded(buffer);
  case 0x45:
    return parseOrderExecuted(buffer);
  case 0x58:
    return parseOrderCanceled(buffer);
  case 0x44:
    return parseOrderDeleted(buffer);
  case 0x42:
    return parseBrokenTrade(buffer);
  default:
    throw new Error('Unknown message type: ' + messageType);
  }
}

function formatVersion(message) {
  var buffer = new Buffer(5);

  buffer.writeUInt8(0x56, 0);
  buffer.writeUInt32BE(message.version, 1);

  return buffer;
}

function parseVersion(buffer) {
  return {
    messageType: 'V',
    version: buffer.readUInt32BE(1)
  };
}

function formatSeconds(message) {
  var buffer = new Buffer(5);

  buffer.writeUInt8(0x53, 0);
  buffer.writeUInt32BE(message.second, 1);

  return buffer;
}

function parseSeconds(buffer) {
  return {
    messageType: 'S',
    second: buffer.readUInt32BE(1)
  };
}

function formatOrderAdded(message) {
  var buffer = new Buffer(30);

  buffer.writeUInt8(0x41, 0);
  buffer.writeUInt32BE(message.timestamp, 1);
  writeUInt64BE(buffer, message.orderNumber, 5);
  writeString(buffer, message.side, 13, 1);
  writeString(buffer, message.instrument, 14, 8);
  buffer.writeUInt32BE(message.quantity, 22);
  buffer.writeUInt32BE(message.price, 26);

  return buffer;
}

function parseOrderAdded(buffer) {
  return {
    messageType: 'A',
    timestamp: buffer.readUInt32BE(1),
    orderNumber: readUInt64BE(buffer, 5),
    side: readString(buffer, 13, 1),
    instrument: readString(buffer, 14, 8),
    quantity: buffer.readUInt32BE(22),
    price: buffer.readUInt32BE(26)
  };
}

function formatOrderExecuted(message) {
  var buffer = new Buffer(21);

  buffer.writeUInt8(0x45, 0);
  buffer.writeUInt32BE(message.timestamp, 1);
  writeUInt64BE(buffer, message.orderNumber, 5);
  buffer.writeUInt32BE(message.quantity, 13);
  buffer.writeUInt32BE(message.matchNumber, 17);

  return buffer;
}

function parseOrderExecuted(buffer) {
  return {
    messageType: 'E',
    timestamp: buffer.readUInt32BE(1),
    orderNumber: readUInt64BE(buffer, 5),
    quantity: buffer.readUInt32BE(13),
    matchNumber: buffer.readUInt32BE(17)
  };
}

function formatOrderCanceled(message) {
  var buffer = new Buffer(17);

  buffer.writeUInt8(0x58, 0);
  buffer.writeUInt32BE(message.timestamp, 1);
  writeUInt64BE(buffer, message.orderNumber, 5);
  buffer.writeUInt32BE(message.canceledQuantity, 13);

  return buffer;
}

function parseOrderCanceled(buffer) {
  return {
    messageType: 'X',
    timestamp: buffer.readUInt32BE(1),
    orderNumber: readUInt64BE(buffer, 5),
    canceledQuantity: buffer.readUInt32BE(13)
  };
}

function formatOrderDeleted(message) {
  var buffer = new Buffer(13);

  buffer.writeUInt8(0x44, 0);
  buffer.writeUInt32BE(message.timestamp, 1);
  writeUInt64BE(buffer, message.orderNumber, 5);

  return buffer;
}

function parseOrderDeleted(buffer) {
  return {
    messageType: 'D',
    timestamp: buffer.readUInt32BE(1),
    orderNumber: readUInt64BE(buffer, 5)
  };
}

function formatBrokenTrade(message) {
  var buffer = new Buffer(9);

  buffer.writeUInt8(0x42, 0);
  buffer.writeUInt32BE(message.timestamp, 1);
  buffer.writeUInt32BE(message.matchNumber, 5);

  return buffer;
}

function parseBrokenTrade(buffer) {
  return {
    messageType: 'B',
    timestamp: buffer.readUInt32BE(1),
    matchNumber: buffer.readUInt32BE(5)
  };
}

function writeUInt64BE(buffer, value, offset) {
  buffer.writeUInt32BE(value.high, offset);
  buffer.writeUInt32BE(value.low, offset + 4);
}

function readUInt64BE(buffer, offset) {
  var high = buffer.readUInt32BE(offset);
  var low  = buffer.readUInt32BE(offset + 4);

  return new Long(low, high, true);
}

function writeString(buffer, value, offset, length) {
  var count = buffer.write(value, offset, length, 'ascii');

  while (count < length) {
    buffer.writeUInt8(0x20);

    count++;
  }
}

function readString(buffer, offset, length) {
  return buffer.toString('ascii', offset, offset + length);
}
