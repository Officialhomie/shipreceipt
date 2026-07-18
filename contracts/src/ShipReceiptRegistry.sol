// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ShipReceipt Registry
/// @notice Stores immutable software verification facts and tamper-evident evidence roots.
contract ShipReceiptRegistry {
    enum ReceiptStatus {
        Failed,
        Partial,
        Verified,
        Revoked
    }

    struct Project {
        address owner;
        bytes32 repositoryHash;
        bool exists;
    }

    struct Receipt {
        address issuer;
        bytes32 projectId;
        bytes32 commitHash;
        bytes32 deploymentHash;
        bytes32 evidenceRoot;
        uint32 passedChecks;
        uint32 totalChecks;
        uint64 verifiedAt;
        ReceiptStatus status;
    }

    error InvalidProjectId();
    error InvalidRepositoryHash();
    error InvalidReceiptData();
    error InvalidCheckCounts();
    error InvalidStatus();
    error ProjectAlreadyExists(bytes32 projectId);
    error ProjectNotFound(bytes32 projectId);
    error ReceiptNotFound(uint256 receiptId);
    error Unauthorized(address caller);
    error ReceiptAlreadyRevoked(uint256 receiptId);

    event ProjectRegistered(
        bytes32 indexed projectId, address indexed owner, bytes32 repositoryHash
    );
    event ReceiptIssued(
        uint256 indexed receiptId,
        bytes32 indexed projectId,
        bytes32 indexed commitHash,
        ReceiptStatus status,
        bytes32 evidenceRoot
    );
    event ReceiptRevoked(uint256 indexed receiptId, bytes32 reasonHash);

    mapping(bytes32 projectId => Project project) public projects;
    mapping(uint256 receiptId => Receipt receipt) private receipts;
    mapping(uint256 receiptId => bytes32 reasonHash) public revocationReasons;
    mapping(bytes32 projectId => uint256 receiptId) public latestReceiptIds;

    uint256 public nextReceiptId = 1;

    /// @notice Registers a repository-backed project under the caller's ownership.
    function registerProject(bytes32 projectId, bytes32 repositoryHash) external {
        if (projectId == bytes32(0)) revert InvalidProjectId();
        if (repositoryHash == bytes32(0)) revert InvalidRepositoryHash();
        if (projects[projectId].exists) revert ProjectAlreadyExists(projectId);

        projects[projectId] =
            Project({ owner: msg.sender, repositoryHash: repositoryHash, exists: true });
        emit ProjectRegistered(projectId, msg.sender, repositoryHash);
    }

    /// @notice Issues an immutable verification receipt for a project owned by the caller.
    /// @return receiptId The monotonically increasing identifier assigned to this receipt.
    function issueReceipt(
        bytes32 projectId,
        bytes32 commitHash,
        bytes32 deploymentHash,
        bytes32 evidenceRoot,
        uint32 passedChecks,
        uint32 totalChecks,
        ReceiptStatus status
    ) external returns (uint256 receiptId) {
        Project memory project = projects[projectId];
        if (!project.exists) revert ProjectNotFound(projectId);
        if (project.owner != msg.sender) revert Unauthorized(msg.sender);
        if (commitHash == bytes32(0) || deploymentHash == bytes32(0) || evidenceRoot == bytes32(0)) revert InvalidReceiptData();
        if (totalChecks == 0 || passedChecks > totalChecks) revert InvalidCheckCounts();
        _validateStatus(passedChecks, totalChecks, status);

        receiptId = nextReceiptId++;
        receipts[receiptId] = Receipt({
            issuer: msg.sender,
            projectId: projectId,
            commitHash: commitHash,
            deploymentHash: deploymentHash,
            evidenceRoot: evidenceRoot,
            passedChecks: passedChecks,
            totalChecks: totalChecks,
            verifiedAt: uint64(block.timestamp),
            status: status
        });
        latestReceiptIds[projectId] = receiptId;

        emit ReceiptIssued(receiptId, projectId, commitHash, status, evidenceRoot);
    }

    /// @notice Revokes a receipt without deleting its original verification facts.
    function revokeReceipt(uint256 receiptId, bytes32 reasonHash) external {
        Receipt storage receipt = receipts[receiptId];
        if (receipt.issuer == address(0)) revert ReceiptNotFound(receiptId);
        if (projects[receipt.projectId].owner != msg.sender) revert Unauthorized(msg.sender);
        if (receipt.status == ReceiptStatus.Revoked) revert ReceiptAlreadyRevoked(receiptId);
        if (reasonHash == bytes32(0)) revert InvalidReceiptData();

        receipt.status = ReceiptStatus.Revoked;
        revocationReasons[receiptId] = reasonHash;
        emit ReceiptRevoked(receiptId, reasonHash);
    }

    /// @notice Returns a receipt, including a revoked receipt.
    function getReceipt(uint256 receiptId) external view returns (Receipt memory) {
        Receipt memory receipt = receipts[receiptId];
        if (receipt.issuer == address(0)) revert ReceiptNotFound(receiptId);
        return receipt;
    }

    /// @notice Returns the latest receipt issued for a project.
    function getLatestReceipt(bytes32 projectId) external view returns (Receipt memory) {
        if (!projects[projectId].exists) revert ProjectNotFound(projectId);
        uint256 receiptId = latestReceiptIds[projectId];
        if (receiptId == 0) revert ReceiptNotFound(0);
        return receipts[receiptId];
    }

    function _validateStatus(uint32 passedChecks, uint32 totalChecks, ReceiptStatus status)
        private
        pure
    {
        if (status == ReceiptStatus.Revoked) revert InvalidStatus();
        if (status == ReceiptStatus.Verified && passedChecks != totalChecks) {
            revert InvalidStatus();
        }
        if (status == ReceiptStatus.Partial && (passedChecks == 0 || passedChecks == totalChecks)) {
            revert InvalidStatus();
        }
        if (status == ReceiptStatus.Failed && passedChecks != 0) revert InvalidStatus();
    }
}
