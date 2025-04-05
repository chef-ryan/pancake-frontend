import { ChainId } from '@pancakeswap/chains'
import { getViemClients } from 'utils/viem.server'
import { Client, getContract } from 'viem'
import { xChainSenderAbi } from './abi'

const serverClient = getViemClients({
  chainId: ChainId.BASE,
})

class XChainSenderSDK {
  public contract: any

  constructor(private readonly client: Client) {
    this.contract = getContract({
      address: '0x4A31512E7Db30561A933aB939ef45bFA8Dc2E611',
      abi: xChainSenderAbi,
      client,
    })
  }

  public async getNextOrderId() {
    return this.contract.read.getNextOrderId()
  }

  public generateCalldata() {
    console.log(this.contract.address)

    // PCSCommand[] memory postBridgeCommand = new PCSCommand[](1);
    // postBridgeCommand[0] = PCSCommand({
    //     command: Commands.UNWRAP_WETH,
    //     commandData: abi.encode(destinationChainReceiver, minOutputAmount)
    // });
    // bytes memory recipientMessage = abi.encode(postBridgeCommand, fallbackReceiver);

    //   AcrossAdapter.AcrossData memory acrossData = AcrossAdapter.AcrossData({
    //     exclusiveRelayer: address(0),
    //     exclusivityDeadline: 0,
    //     quoteTimestamp: 1743687143, // from tiemstamp in API
    //     fillDeadline: uint32(block.timestamp + 120 seconds),
    //     relayerFeePct: 31756004104093931 // from totalRelayFee.pct
    // });

    //   bytes memory commandData = abi.encode(
    //     BridgeData({
    //         inputToken: Constants.ETH.toBytes32(),
    //         // Note, this can be set to the zero address (0x0) in which case, fillers will replace this with the destination chain equivalent of the input token
    //         outputToken: address(0).toBytes32(),
    //         inputAmount: inputAmount,
    //         minOutputAmount: minOutputAmount,
    //         target: acrossAdapter,
    //         data: abi.encode(acrossData),
    //         destinationChainId: destinationChainId,
    //         refundRecipient: refundRecipient,
    //         recipient: destinationChainAcrossAdapter.toBytes32(),
    //         recipientMessage: recipientMessage
    //     })
    // );

    //   xChainSender.send{value: inputAmount}(
    //     PCSOrderData({inputToken: Constants.ETH.toBytes32(), inputAmount: inputAmount, commands: preBridgeCommand})
    // );

    return '0x9aa90356000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017e65e6b9b166fb8e7c59432f0db126711246bc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004e0e613720800000000000000000000000000000000000000000000000000000195dcbef1a00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000009f89891a1833465e6924000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000016000000000000000000000000017e65e6b9b166fb8e7c59432f0db126711246bc0000000000000000000000000000000000000000000000000000000000000000104000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000b62bb233af2f83028be19626256a9894b68aae5e0000000000000000000000000000000000000000000000000000000000000001000000000000000000002710b62bb233af2f83028be19626256a9894b68aae5e00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
  }
}

export const xChainSenderSDK = new XChainSenderSDK(serverClient)
