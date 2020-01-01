/*
 * Copyright 2015 Parity authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        messageType: PMD.MessageType.VERSION,
        version: 1,
      },
    },
    {
      name: 'Order Added',
      formatted: [
        0x41,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x42,
        0x46, 0x4f, 0x4f, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04,
      ],
      parsed: {
        messageType: PMD.MessageType.ORDER_ADDED,
        timestamp: 1,
        orderNumber: 4294967298,
        side: PMD.Side.BUY,
        instrument: 'FOO     ',
        quantity: 3,
        price: 4,
      },
    },
    {
      name: 'Order Executed',
      formatted: [
        0x45,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x04,
      ],
      parsed: {
        messageType: PMD.MessageType.ORDER_EXECUTED,
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
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
      ],
      parsed: {
        messageType: PMD.MessageType.ORDER_CANCELED,
        timestamp: 1,
        orderNumber: 4294967298,
        canceledQuantity: 3,
      },
    },
  ];

  describe('#format()', function () {
    messages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepStrictEqual(PMD.format(message.parsed), Buffer.from(message.formatted));
      });
    });

    it('handles unknown message type', function () {
      const message = {
        messageType: '?'
      };

      assert.throws(() => PMD.format(message), /Unknown message type: \?/);
    });

    it('handles too short string', function () {
      const formatted = [
        0x41,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x42,
        0x46, 0x4f, 0x4f, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04,
      ];

      const parsed = {
        messageType: PMD.MessageType.ORDER_ADDED,
        timestamp: 1,
        orderNumber: 2,
        side: PMD.Side.BUY,
        instrument: 'FOO',
        quantity: 3,
        price: 4,
      };

      assert.deepStrictEqual(PMD.format(parsed), Buffer.from(formatted));
    });

    it('handles too long string', function () {
      const formatted = [
        0x41,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x42,
        0x46, 0x4f, 0x4f, 0x20, 0x42, 0x41, 0x52, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04,
      ];

      const parsed = {
        messageType: PMD.MessageType.ORDER_ADDED,
        timestamp: 1,
        orderNumber: 2,
        side: PMD.Side.BUY,
        instrument: 'FOO BAR BAZ',
        quantity: 3,
        price: 4,
      }

      assert.deepStrictEqual(PMD.format(parsed), Buffer.from(formatted));
    });
  });

  describe('#parse()', function () {
    messages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepStrictEqual(PMD.parse(Buffer.from(message.formatted)), message.parsed);
      });
    });

    it('handles unknown message type', function () {
      const buffer = Buffer.from([ 0x3f ]);

      assert.throws(() => PMD.parse(buffer), /Unknown message type: 63/);
    });
  });
});
