'use strict';

const MessageType = {
  VERSION: 'V',
  ORDER_ADDED: 'A',
  ORDER_EXECUTED: 'E',
  ORDER_CANCELED: 'X',
};

exports.MessageType = MessageType;

const Side = {
  BUY: 'B',
  SELL: 'S'
};

exports.Side = Side;

exports.format = (message) => {
  switch (message.messageType) {
    case MessageType.VERSION:
      return formatVersion(message);
    case MessageType.ORDER_ADDED:
      return formatOrderAdded(message);
    case MessageType.ORDER_EXECUTED:
      return formatOrderExecuted(message);
    case MessageType.ORDER_CANCELED:
      return formatOrderCanceled(message);
    default:
      throw new Error('Unknown message type: ' + message.messageType);
  }
};

exports.parse = (buffer) => {
  const messageType = buffer.readUInt8(0);

  switch (messageType) {
    case 0x56:
      return parseVersion(buffer);
    case 0x41:
      return parseOrderAdded(buffer);
    case 0x45:
      return parseOrderExecuted(buffer);
    case 0x58:
      return parseOrderCanceled(buffer);
    default:
      throw new Error('Unknown message type: ' + messageType);
  }
};

function formatVersion(message) {
  const buffer = Buffer.allocUnsafe(5);

  buffer.writeUInt8(0x56, 0);
  buffer.writeUInt32BE(message.version, 1);

  return buffer;
}

function parseVersion(buffer) {
  return {
    messageType: 'V',
    version: buffer.readUInt32BE(1),
  };
}

function formatOrderAdded(message) {
  const buffer = Buffer.allocUnsafe(42);

  buffer.writeUInt8(0x41, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeUInt64BE(buffer, message.orderNumber, 9);
  writeString(buffer, message.side, 17, 1);
  writeString(buffer, message.instrument, 18, 8);
  writeUInt64BE(buffer, message.quantity, 26);
  writeUInt64BE(buffer, message.price, 34);

  return buffer;
}

function parseOrderAdded(buffer) {
  return {
    messageType: MessageType.ORDER_ADDED,
    timestamp: readUInt64BE(buffer, 1),
    orderNumber: readUInt64BE(buffer, 9),
    side: readString(buffer, 17, 1),
    instrument: readString(buffer, 18, 8),
    quantity: readUInt64BE(buffer, 26),
    price: readUInt64BE(buffer, 34),
  };
}

function formatOrderExecuted(message) {
  const buffer = Buffer.allocUnsafe(29);

  buffer.writeUInt8(0x45, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeUInt64BE(buffer, message.orderNumber, 9);
  writeUInt64BE(buffer, message.quantity, 17);
  buffer.writeUInt32BE(message.matchNumber, 25);

  return buffer;
}

function parseOrderExecuted(buffer) {
  return {
    messageType: MessageType.ORDER_EXECUTED,
    timestamp: readUInt64BE(buffer, 1),
    orderNumber: readUInt64BE(buffer, 9),
    quantity: readUInt64BE(buffer, 17),
    matchNumber: buffer.readUInt32BE(25),
  };
}

function formatOrderCanceled(message) {
  const buffer = Buffer.allocUnsafe(25);

  buffer.writeUInt8(0x58, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeUInt64BE(buffer, message.orderNumber, 9);
  writeUInt64BE(buffer, message.canceledQuantity, 17);

  return buffer;
}

function parseOrderCanceled(buffer) {
  return {
    messageType: MessageType.ORDER_CANCELED,
    timestamp: readUInt64BE(buffer, 1),
    orderNumber: readUInt64BE(buffer, 9),
    canceledQuantity: readUInt64BE(buffer, 17),
  };
}

function writeUInt64BE(buffer, value, offset) {
  buffer.writeUInt32BE(value / 0x100000000, offset);
  buffer.writeUInt32BE(value % 0x100000000, offset + 4);
}

function readUInt64BE(buffer, offset) {
  const high = buffer.readUInt32BE(offset);
  const low = buffer.readUInt32BE(offset + 4);

  return 0x100000000 * high + low;
}

function writeString(buffer, value, offset, length) {
  const count = buffer.write(value, offset, length, 'ascii');

  buffer.fill(0x20, offset + count, offset + length);
}

function readString(buffer, offset, length) {
  return buffer.toString('ascii', offset, offset + length);
}
