/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ethers, Result } from 'ethers';
import { EventEmitterABI } from './abi';
import { BLOCK_RANGE, EventEmitterAddress, Topics } from './constant';
import { EventDataType, SimplePosition } from './types';

@Injectable()
export class AppService {
  private blockNumber = 370298500;
  private isProcessing = false;
  private readonly logger = new Logger(AppService.name);
  private readonly provider = new ethers.JsonRpcProvider(
    'https://arb1.arbitrum.io/rpc',
  );
  private readonly iface = new ethers.Interface(EventEmitterABI);
  private positionMap: Map<string, SimplePosition> = new Map();

  getPositions() {
    return [...this.positionMap.values()];
  }

  getPositionsByWallet(wallet: string) {
    return [...this.positionMap.values()].filter((p) => p.account === wallet);
  }

  @Interval(3000)
  async crawl() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    const latestBlock = await this.provider.getBlockNumber();
    const fromBlock = this.blockNumber;
    const toBlock =
      this.blockNumber + BLOCK_RANGE < latestBlock
        ? this.blockNumber + BLOCK_RANGE
        : latestBlock;

    if (fromBlock > latestBlock) {
      this.isProcessing = false;
      return;
    }

    const topics = Topics.map((i) => this.iface.getEvent(i)?.topicHash || null);

    const logs = await this.provider.getLogs({
      fromBlock,
      toBlock,
      address: EventEmitterAddress,
      topics: [topics],
    });

    this.logger.debug(
      `Found ${logs.length} logs from block ${fromBlock} to ${toBlock}`,
    );

    for (const log of logs) {
      const parsed = this.iface.parseLog(log);

      if (
        parsed.args[1] !== 'PositionIncrease' &&
        parsed.args[1] !== 'PositionDecrease'
      ) {
        continue;
      }

      const eventData = parsed.args.toObject().eventData as Result;

      const sizeInUsd = (
        eventData.toObject() as EventDataType
      ).uintItems.toObject(true).items[0].value as bigint;
      const sizeInTokens = (
        eventData.toObject() as EventDataType
      ).uintItems.toObject(true).items[1].value as bigint;
      const collateralAmount = (
        eventData.toObject() as EventDataType
      ).uintItems.toObject(true).items[2].value as bigint;
      const executionPrice = (
        eventData.toObject() as EventDataType
      ).uintItems.toObject(true).items[7].value as bigint;
      const isLong = (eventData.toObject() as EventDataType).boolItems.toObject(
        true,
      ).items['_'].value as boolean;
      const account = (
        eventData.toObject() as EventDataType
      ).addressItems.toObject(true).items[0].value as string;
      const market = (
        eventData.toObject() as EventDataType
      ).addressItems.toObject(true).items[1].value as string;
      const collateralToken = (
        eventData.toObject() as EventDataType
      ).addressItems.toObject(true).items[2].value as string;
      const positionKey = (
        eventData.toObject() as EventDataType
      ).bytes32Items.toObject(true).items[1].value as string;

      const currPosition = this.positionMap.get(positionKey);

      this.positionMap.set(positionKey, {
        account,
        market,
        collateralToken,
        isLong,
        sizeInUsd: sizeInUsd.toString(),
        sizeInTokens: sizeInTokens.toString(),
        collateralAmount: collateralAmount.toString(),
        executionPrice: !currPosition
          ? executionPrice.toString()
          : currPosition.executionPrice,
      });
    }

    this.blockNumber = toBlock;
    this.isProcessing = false;
  }
}
