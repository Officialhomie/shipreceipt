// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ShipReceiptRegistry } from "../src/ShipReceiptRegistry.sol";

interface Vm {
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract DeployShipReceipt {
    Vm private constant VM = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (ShipReceiptRegistry registry) {
        VM.startBroadcast();
        registry = new ShipReceiptRegistry();
        VM.stopBroadcast();
    }
}
