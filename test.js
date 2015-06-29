var Long   = require('long');
var PMD    = require('./');
var assert = require('chai').assert;

describe('PMD', function () {
  var messages = [
    {
      name: 'Version',
      formatted: [
        0x56,
        0x00, 0x00, 0x00, 0x01
      ],
      parsed: {
        messageType: 'V',
        version: 1
      }
    },
    {
      name: 'Seconds',
      formatted: [
        0x53,
        0x00, 0x00, 0x00, 0x01
      ],
      parsed: {
        messageType: 'S',
        second: 1
      }
    },
    {
      name: 'Order Added',
      formatted: [
        0x41,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x42,
        0x46, 0x4F, 0x4F, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x04
      ],
      parsed: {
        messageType: 'A',
        timestamp: 1,
        orderNumber: new Long(2, 0, true),
        side: 'B',
        instrument: 'FOO     ',
        quantity: 3,
        price: 4
      }
    },
    {
      name: 'Order Executed',
      formatted: [
        0x45,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x04
      ],
      parsed: {
        messageType: 'E',
        timestamp: 1,
        orderNumber: new Long(2, 0, true),
        quantity: 3,
        matchNumber: 4
      }
    },
    {
      name: 'Order Canceled',
      formatted: [
        0x58,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x00, 0x00, 0x03
      ],
      parsed: {
        messageType: 'X',
        timestamp: 1,
        orderNumber: new Long(2, 0, true),
        canceledQuantity: 3
      }
    },
    {
      name: 'Order Deleted',
      formatted: [
        0x44,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02
      ],
      parsed: {
        messageType: 'D',
        timestamp: 1,
        orderNumber: new Long(2, 0, true)
      }
    },
    {
      name: 'Broken Trade',
      formatted: [
        0x42,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x02
      ],
      parsed: {
        messageType: 'B',
        timestamp: 1,
        matchNumber: 2
      }
    }
  ];

  describe('#format()', function () {
    messages.forEach(function (message) {
      it('handles ' + message.name + ' message', function () {
        assert.deepEqual(PMD.format(message.parsed), new Buffer(message.formatted));
      });
    });

    it('handles unknown message type', function () {
      var message = {
        messageType: '?'
      };

      assert.throws(function () { PMD.format(message) }, 'Unknown message type: ?');
    });
  });

  describe('#parse()', function () {
    messages.forEach(function (message) {
      it('handles ' + message.name + ' message', function () {
        assert.deepEqual(PMD.parse(new Buffer(message.formatted)), message.parsed);
      });
    });

    it('handles unknown message type', function () {
      var buffer = new Buffer([ 0x3F ]);

      assert.throws(function () { PMD.parse(buffer) }, 'Unknown message type: 63');
    });
  });
});
