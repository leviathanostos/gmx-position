// import { Result } from 'ethers';

// export function resultToObject(result: Result): any {
//   if (Result.isArray(result)) {
//     const obj: any = {};
//     result.forEach((v, i) => {
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
//       obj[i] = resultToObject(v);
//     });
//     for (const [k, v] of Object.entries(result)) {
//       if (isNaN(Number(k))) {
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
//         obj[k] = resultToObject(v);
//       }
//     }
//     return obj;
//   }
//   return result;
// }

// export function parsePositionIncrease(log: Log) {
//   const parsed = iface.parseLog(log);
//   if (parsed.args.eventName !== 'PositionIncrease') return null;

//   const eventData = resultToObject(parsed.args.eventData);

//   return {
//     account: eventData[0][0], // account address
//     market: eventData[1][0], // market address
//     collateralToken: eventData[2][0], // collateral token
//     sizeDeltaUsd: BigInt(eventData[3][0]),
//     collateralDeltaUsd: BigInt(eventData[4][0]),
//     executionPrice: BigInt(eventData[5][0]),
//     fees: {
//       borrowing: BigInt(eventData[6][0] ?? 0),
//       funding: BigInt(eventData[6][1] ?? 0),
//     },
//   };
// }
