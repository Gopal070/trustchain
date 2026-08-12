// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateRegistry {

    // ==================== STATE VARIABLES ====================

    address public owner;

    struct Certificate {
        string certId;
        string hashSHA256;
        string ipfsCID;
        string issuerName;
        string studentName;
        string degree;
        uint256 issuedYear;
        uint256 timestamp;
        address addedBy;
        bool isValid;
    }

    struct IssuerInfo {
        string name;
        bool isAuthorized;
    }

    // ==================== MAPPINGS ====================

    mapping(string => Certificate) private certificates;
    mapping(string => bool) private hashExists;
    mapping(string => string) private certIdToHash;
    mapping(address => IssuerInfo) public authorizedIssuers;

    // ==================== EVENTS ====================

    event CertificateAdded(
        string certId,
        string hashSHA256,
        string issuerName,
        string studentName,
        uint256 timestamp
    );

    event CertificateRevoked(
        string certId,
        string reason,
        uint256 timestamp
    );

    event IssuerAuthorized(
        address indexed issuerAddress,
        string issuerName
    );

    event IssuerRevoked(
        address indexed issuerAddress
    );

    // ==================== MODIFIERS ====================

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(
            authorizedIssuers[msg.sender].isAuthorized,
            "Not an authorized issuer"
        );
        _;
    }

    // ==================== CONSTRUCTOR ====================

    constructor() {
        owner = msg.sender;
    }

    // ==================== OWNER FUNCTIONS ====================

    /// @notice Grant a university wallet permission to register certificates
    /// @param _issuerAddress Wallet address of the university
    /// @param _name Name of the university
    function authorizeIssuer(
        address _issuerAddress,
        string memory _name
    ) external onlyOwner {
        require(_issuerAddress != address(0), "Invalid address");
        require(bytes(_name).length > 0, "Name cannot be empty");

        authorizedIssuers[_issuerAddress] = IssuerInfo({
            name: _name,
            isAuthorized: true
        });

        emit IssuerAuthorized(_issuerAddress, _name);
    }

    /// @notice Revoke a university's registration rights
    /// @param _issuerAddress Wallet address to revoke
    function revokeIssuer(
        address _issuerAddress
    ) external onlyOwner {
        require(
            authorizedIssuers[_issuerAddress].isAuthorized,
            "Issuer not found"
        );
        authorizedIssuers[_issuerAddress].isAuthorized = false;
        emit IssuerRevoked(_issuerAddress);
    }

    // ==================== ISSUER FUNCTIONS ====================

    /// @notice Register a new certificate on the blockchain
    /// @param _certId Unique certificate ID
    /// @param _hashSHA256 64-character SHA-256 hash of the file
    /// @param _ipfsCID IPFS Content Identifier
    /// @param _studentName Name of the student
    /// @param _degree Degree name
    /// @param _issuedYear Year of issue
    function addCertificate(
        string memory _certId,
        string memory _hashSHA256,
        string memory _ipfsCID,
        string memory _studentName,
        string memory _degree,
        uint256 _issuedYear
    ) external onlyAuthorizedIssuer {

        require(bytes(_certId).length > 0, "CertId cannot be empty");
        require(
            bytes(_hashSHA256).length == 64,
            "Hash must be 64 characters (SHA-256)"
        );
        require(
            !hashExists[_hashSHA256],
            "Certificate hash already exists"
        );
        require(
            bytes(certIdToHash[_certId]).length == 0,
            "CertId already registered"
        );

        string memory issuerName = authorizedIssuers[msg.sender].name;

        certificates[_hashSHA256] = Certificate({
            certId: _certId,
            hashSHA256: _hashSHA256,
            ipfsCID: _ipfsCID,
            issuerName: issuerName,
            studentName: _studentName,
            degree: _degree,
            issuedYear: _issuedYear,
            timestamp: block.timestamp,
            addedBy: msg.sender,
            isValid: true
        });

        hashExists[_hashSHA256] = true;
        certIdToHash[_certId] = _hashSHA256;

        emit CertificateAdded(
            _certId,
            _hashSHA256,
            issuerName,
            _studentName,
            block.timestamp
        );
    }

    /// @notice Revoke a certificate
    /// @param _certId Certificate ID to revoke
    /// @param _reason Reason for revocation
    function revokeCertificate(
        string memory _certId,
        string memory _reason
    ) external onlyAuthorizedIssuer {

        string memory hash = certIdToHash[_certId];
        require(bytes(hash).length > 0, "Certificate not found");
        require(certificates[hash].isValid, "Already revoked");
        require(
            certificates[hash].addedBy == msg.sender ||
            msg.sender == owner,
            "Not authorized to revoke this certificate"
        );

        certificates[hash].isValid = false;

        emit CertificateRevoked(_certId, _reason, block.timestamp);
    }

    // ==================== PUBLIC VIEW FUNCTIONS (Zero Gas) ====================

    /// @notice Verify a certificate by its SHA-256 hash
    /// @param _hashSHA256 64-character SHA-256 hash
    function verifyCertificate(
        string memory _hashSHA256
    ) external view returns (
        bool found,
        bool isValid,
        string memory certId,
        string memory issuer,
        string memory student,
        string memory degree,
        uint256 year,
        string memory ipfsCID,
        uint256 timestamp
    ) {
        if (!hashExists[_hashSHA256]) {
            return (false, false, "", "", "", "", 0, "", 0);
        }

        Certificate memory cert = certificates[_hashSHA256];
        return (
            true,
            cert.isValid,
            cert.certId,
            cert.issuerName,
            cert.studentName,
            cert.degree,
            cert.issuedYear,
            cert.ipfsCID,
            cert.timestamp
        );
    }

    /// @notice Get certificate details by certificate ID
    /// @param _certId Certificate ID to look up
    function getCertificateById(
        string memory _certId
    ) external view returns (
        bool found,
        bool isValid,
        string memory hashSHA256,
        string memory issuer,
        string memory student,
        string memory degree,
        uint256 year,
        string memory ipfsCID,
        uint256 timestamp
    ) {
        string memory hash = certIdToHash[_certId];
        if (bytes(hash).length == 0) {
            return (false, false, "", "", "", "", 0, "", 0);
        }

        Certificate memory cert = certificates[hash];
        return (
            true,
            cert.isValid,
            cert.hashSHA256,
            cert.issuerName,
            cert.studentName,
            cert.degree,
            cert.issuedYear,
            cert.ipfsCID,
            cert.timestamp
        );
    }

    /// @notice Get info about an authorized issuer
    /// @param _addr Wallet address of the issuer
    function getIssuerInfo(
        address _addr
    ) external view returns (string memory name, bool isAuthorized) {
        IssuerInfo memory info = authorizedIssuers[_addr];
        return (info.name, info.isAuthorized);
    }
}
