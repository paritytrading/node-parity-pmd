'use strict';

const PMD = require('./');
const assert = require('assert');

describe('PMD', function () {
  const messages = [
    {
      name: 'Version',
      formatted: [
        0x56,
        0x00, 0x00, 0x00, 0x01,
      ],
      parsed: {
        messageType: 'V',
        version: 1,
      },
    },
    {
      name: 'Seconds',
      formatted: [
        0x53,
        0x00, 0x00, 0x00, 0x01,
      ],
      parsed: {
        messageType: 'S',
        second: 1,
      },
    },
    {
      name: 'Order Added',
      formatted: [
        0x41,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x42,
        0x46, 0x4f, 0x4f, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x04,
      ],
      parsed: {
        messageType: 'A',
        timestamp: 1,
        orderNumber: 4294967298,
        side: 'B',
        instrument: 'FOO     ',
        quantity: 3,
        price: 4,
      },
    },
    {
      name: 'Order Executed',
      formatted: [
        0x45,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x04,
      ],
      parsed: {
        messageType: 'E',
        timestamp: 1,
        orderNumber: 4294967298,
        quantity: 3,
        matchNumber: 4,
      },
    },
    {
      name: 'Order Canceled',
      formatted: [
        0x58,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x00, 0x00, 0x03,
      ],
      parsed: {
        messageType: 'X',
        timestamp: 1,
        orderNumber: 4294967298,
        canceledQuantity: 3,
      },
    },
    {
      name: 'Order Deleted',
      formatted: [
        0x44,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
      ],
      parsed: {
        messageType: 'D',
        timestamp: 1,
        orderNumber: 4294967298,
      },
    },
    {
      name: 'Broken Trade',
      formatted: [
        0x42,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x02,
      ],
      parsed: {
        messageType: 'B',
        timestamp: 1,
        matchNumber: 2,
      },
    },
  ];

  describe('#format()', function () {
    messages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepEqual(PMD.format(message.parsed), Buffer.from(message.formatted));
      });
    });

    it('handles unknown message type', function () {
      const message = {
        messageType: '?'
      };

      assert.throws(() => { PMD.format(message) }, /Unknown message type: \?/);
    });

    it('handles too long string', function () {
      const formatted = [
        0x41,
        0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x42,
        0x46, 0x4f, 0x4f, 0x20, 0x42, 0x41, 0x52, 0x20,
        0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x04,
      ];

      const parsed = {
        messageType: 'A',
        timestamp: 1,
        orderNumber: 2,
        side: 'B',
        instrument: 'FOO BAR BAZ',
        quantity: 3,
        price: 4,
      }

      assert.deepEqual(PMD.format(parsed), Buffer.from(formatted));
    });
  });

  describe('#parse()', function () {
    messages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepEqual(PMD.parse(Buffer.from(message.formatted)), message.parsed);
      });
    });

    it('handles unknown message type', function () {
      const buffer = Buffer.from([ 0x3F ]);

      assert.throws(() => { PMD.parse(buffer) }, /Unknown message type: 63/);
    });
  });
});
