/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { KycContract } from './ekyc-contract';
import {KycPrivateAssetContract} from './privatechaincode/kyc-private-asset-contract';
export { KycContract } from './ekyc-contract';
export { KycPrivateAssetContract } from './privatechaincode/kyc-private-asset-contract';
export const contracts: any[] = [ KycContract ,KycPrivateAssetContract];
