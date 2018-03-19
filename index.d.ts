// Type definitions for Parity PMD 0.4.0
// Project: https://github.com/paritytrading/node-parity-pmd
// Definitions by: Leo Vujanić <https://github.com/leovujanic>

import {Buffer} from "node";


export enum MessageType {
    VERSION = "V",
    ORDER_ADDED = "A",
    ORDER_EXECUTED = "E",
    ORDER_CANCELED = "X",
}

export enum Side {
    BUY = "B",
    SELL = "S"
}

export interface Version {
    messageType: MessageType.VERSION,
    version: number;
}

export interface OrderAdded {
    messageType: MessageType.ORDER_ADDED,
    timestamp: number;
    orderNumber: number;
    side: Side;
    instrument: string;
    quantity: number;
    price: number;
}

export interface OrderExecuted {
    messageType: MessageType.ORDER_EXECUTED,
    timestamp: number;
    orderNumber: number;
    quantity: number;
    matchNumber: number;
}

export interface OrderCanceled {
    messageType: MessageType.ORDER_CANCELED,
    timestamp: number;
    orderNumber: number;
    canceledQuantity: number;
}


/**
 * Declares Parity PMD message structure
 * Full reference can be found here https://github.com/paritytrading/parity/blob/master/libraries/net/doc/PMD.md
 */

export function format(message: Version | OrderAdded | OrderExecuted | OrderCanceled): Buffer;

export function parse(buffer: Buffer): Version | OrderAdded | OrderExecuted | OrderCanceled;
