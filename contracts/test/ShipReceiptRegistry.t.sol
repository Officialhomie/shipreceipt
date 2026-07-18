// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ShipReceiptRegistry } from "../src/ShipReceiptRegistry.sol";

interface Vm {
    function expectEmit(bool, bool, bool, bool) external;
}

contract RegistryActor {
    function issue(
        ShipReceiptRegistry registry,
        bytes32 projectId,
        bytes32 commitHash,
        bytes32 deploymentHash,
        bytes32 evidenceRoot,
        uint32 passed,
        uint32 total,
        ShipReceiptRegistry.ReceiptStatus status
    ) external returns (uint256) {
        return registry.issueReceipt(
            projectId, commitHash, deploymentHash, evidenceRoot, passed, total, status
        );
    }

    function revoke(ShipReceiptRegistry registry, uint256 receiptId, bytes32 reasonHash) external {
        registry.revokeReceipt(receiptId, reasonHash);
    }
}

contract ShipReceiptRegistryTest {
    Vm private constant VM = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    event ProjectRegistered(
        bytes32 indexed projectId, address indexed owner, bytes32 repositoryHash
    );
    event ReceiptIssued(
        uint256 indexed receiptId,
        bytes32 indexed projectId,
        bytes32 indexed commitHash,
        ShipReceiptRegistry.ReceiptStatus status,
        bytes32 evidenceRoot
    );
    event ReceiptRevoked(uint256 indexed receiptId, bytes32 reasonHash);

    ShipReceiptRegistry private registry;
    RegistryActor private attacker;

    bytes32 private constant PROJECT = keccak256("shipreceipt");
    bytes32 private constant REPOSITORY = keccak256("https://github.com/example/shipreceipt");
    bytes32 private constant COMMIT = keccak256("full-commit-sha");
    bytes32 private constant DEPLOYMENT = keccak256("https://shipreceipt.example");
    bytes32 private constant EVIDENCE = keccak256("canonical-evidence");

    function setUp() public {
        registry = new ShipReceiptRegistry();
        attacker = new RegistryActor();
    }

    function testProjectRegistrationAndEvent() public {
        VM.expectEmit(true, true, false, true);
        emit ProjectRegistered(PROJECT, address(this), REPOSITORY);
        registry.registerProject(PROJECT, REPOSITORY);

        (address owner, bytes32 repositoryHash, bool exists) = registry.projects(PROJECT);
        require(owner == address(this), "owner");
        require(repositoryHash == REPOSITORY, "repository");
        require(exists, "exists");
    }

    function testDuplicateRegistrationReverts() public {
        _register();
        try registry.registerProject(PROJECT, REPOSITORY) {
            revert("expected revert");
        } catch { }
    }

    function testReceiptIssuanceAndEvent() public {
        _register();
        VM.expectEmit(true, true, true, true);
        emit ReceiptIssued(1, PROJECT, COMMIT, ShipReceiptRegistry.ReceiptStatus.Verified, EVIDENCE);
        uint256 id = _issue(3, 3, ShipReceiptRegistry.ReceiptStatus.Verified);
        require(id == 1, "receipt id");

        ShipReceiptRegistry.Receipt memory receipt = registry.getReceipt(id);
        require(receipt.issuer == address(this), "issuer");
        require(receipt.evidenceRoot == EVIDENCE, "evidence");
        require(receipt.passedChecks == 3 && receipt.totalChecks == 3, "counts");
    }

    function testUnauthorizedIssuanceReverts() public {
        _register();
        try attacker.issue(
            registry,
            PROJECT,
            COMMIT,
            DEPLOYMENT,
            EVIDENCE,
            1,
            1,
            ShipReceiptRegistry.ReceiptStatus.Verified
        ) returns (
            uint256
        ) {
            revert("expected revert");
        } catch { }
    }

    function testVerifiedStatusValidation() public {
        _register();
        _expectIssueRevert(2, 3, ShipReceiptRegistry.ReceiptStatus.Verified);
        _issue(3, 3, ShipReceiptRegistry.ReceiptStatus.Verified);
    }

    function testPartialStatusValidation() public {
        _register();
        _expectIssueRevert(0, 3, ShipReceiptRegistry.ReceiptStatus.Partial);
        _expectIssueRevert(3, 3, ShipReceiptRegistry.ReceiptStatus.Partial);
        _issue(2, 3, ShipReceiptRegistry.ReceiptStatus.Partial);
    }

    function testReceiptFailedStatusValidation() public {
        _register();
        _expectIssueRevert(1, 3, ShipReceiptRegistry.ReceiptStatus.Failed);
        _issue(0, 3, ShipReceiptRegistry.ReceiptStatus.Failed);
    }

    function testRevocationAndEvent() public {
        _register();
        uint256 id = _issue(3, 3, ShipReceiptRegistry.ReceiptStatus.Verified);
        bytes32 reason = keccak256("deployment removed");
        VM.expectEmit(true, false, false, true);
        emit ReceiptRevoked(id, reason);
        registry.revokeReceipt(id, reason);

        ShipReceiptRegistry.Receipt memory receipt = registry.getReceipt(id);
        require(receipt.status == ShipReceiptRegistry.ReceiptStatus.Revoked, "revoked");
        require(registry.revocationReasons(id) == reason, "reason");
    }

    function testUnauthorizedRevocationReverts() public {
        _register();
        uint256 id = _issue(3, 3, ShipReceiptRegistry.ReceiptStatus.Verified);
        try attacker.revoke(registry, id, keccak256("reason")) {
            revert("expected revert");
        } catch { }
    }

    function testLatestReceiptLookup() public {
        _register();
        _issue(1, 2, ShipReceiptRegistry.ReceiptStatus.Partial);
        _issue(2, 2, ShipReceiptRegistry.ReceiptStatus.Verified);
        ShipReceiptRegistry.Receipt memory latest = registry.getLatestReceipt(PROJECT);
        require(latest.passedChecks == 2, "latest");
        require(registry.latestReceiptIds(PROJECT) == 2, "latest id");
    }

    function testReceiptImmutabilityAcrossLaterIssuance() public {
        _register();
        uint256 firstId = _issue(1, 2, ShipReceiptRegistry.ReceiptStatus.Partial);
        ShipReceiptRegistry.Receipt memory beforeReceipt = registry.getReceipt(firstId);
        _issue(2, 2, ShipReceiptRegistry.ReceiptStatus.Verified);
        ShipReceiptRegistry.Receipt memory afterReceipt = registry.getReceipt(firstId);
        require(beforeReceipt.evidenceRoot == afterReceipt.evidenceRoot, "root changed");
        require(beforeReceipt.passedChecks == afterReceipt.passedChecks, "counts changed");
        require(beforeReceipt.status == afterReceipt.status, "status changed");
    }

    function testTotalChecksMustBePositive() public {
        _register();
        _expectIssueRevert(0, 0, ShipReceiptRegistry.ReceiptStatus.Failed);
    }

    function _register() private {
        registry.registerProject(PROJECT, REPOSITORY);
    }

    function _issue(uint32 passed, uint32 total, ShipReceiptRegistry.ReceiptStatus status)
        private
        returns (uint256)
    {
        return registry.issueReceipt(PROJECT, COMMIT, DEPLOYMENT, EVIDENCE, passed, total, status);
    }

    function _expectIssueRevert(
        uint32 passed,
        uint32 total,
        ShipReceiptRegistry.ReceiptStatus status
    ) private {
        try registry.issueReceipt(
            PROJECT, COMMIT, DEPLOYMENT, EVIDENCE, passed, total, status
        ) returns (
            uint256
        ) {
            revert("expected revert");
        } catch { }
    }
}
