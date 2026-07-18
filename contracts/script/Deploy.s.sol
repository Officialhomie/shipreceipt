// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ShipReceiptRegistry } from "../src/ShipReceiptRegistry.sol";

interface Vm {
    function envUint(string calldata name) external view returns (uint256 value);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract DeployShipReceipt {
    Vm private constant VM = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (ShipReceiptRegistry registry) {
        uint256 deployerPrivateKey = VM.envUint("DEPLOYER_PRIVATE_KEY");
        VM.startBroadcast(deployerPrivateKey);
        registry = new ShipReceiptRegistry();
        VM.stopBroadcast();
    }
}
