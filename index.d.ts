// Type definitions for Parity PMD 0.4.0
// Project: https://github.com/paritytrading/node-parity-pmd
// Definitions by: Leo Vujanić <https://github.com/leovujanic>

import {Buffer} from "node";

/**
 * Declares Parity PMD message structure
 * Full reference can be found here https://github.com/paritytrading/parity/blob/master/libraries/net/doc/PMD.md
 */
export interface PMDMessage {
    messageType: string;
    version?: string;
    timestamp?: number;
    orderNumber?: number;
    side?: string;
    instrument?: string;
    quantity?: number;
    price?: number;
}

export function format(message: PMDMessage): Buffer;

export function parse(buffer: Buffer): PMDMessage;
