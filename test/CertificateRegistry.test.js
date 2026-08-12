// test/CertificateRegistry.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let registry, owner, issuer, issuer2, randomUser;

  const sampleHash = "a".repeat(64);
  const sampleHash2 = "b".repeat(64);
  const sampleCertId = "IIT-2023-CS-001";
  const sampleCertId2 = "IIT-2023-CS-002";

  beforeEach(async function () {
    [owner, issuer, issuer2, randomUser] = await ethers.getSigners();

    const CertificateRegistry = await ethers.getContractFactory(
      "CertificateRegistry"
    );
    registry = await CertificateRegistry.deploy();
    await registry.waitForDeployment();
  });

  // ==================== DEPLOYMENT ====================

  describe("Deployment", function () {
    it("owner correctly set ho gaya", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });
  });

  // ==================== ISSUER AUTHORIZATION ====================

  describe("Issuer Authorization", function () {
    it("owner issuer authorize kar sakta hai", async function () {
      await registry.authorizeIssuer(issuer.address, "IIT Bombay");
      const [name, isAuthorized] = await registry.getIssuerInfo(issuer.address);
      expect(name).to.equal("IIT Bombay");
      expect(isAuthorized).to.be.true;
    });

    it("non-owner authorize nahi kar sakta", async function () {
      await expect(
        registry.connect(randomUser).authorizeIssuer(issuer.address, "Fake Uni")
      ).to.be.revertedWith("Only owner can call this");
    });

    it("zero address authorize nahi ho sakta", async function () {
      await expect(
        registry.authorizeIssuer(ethers.ZeroAddress, "Test")
      ).to.be.revertedWith("Invalid address");
    });

    it("owner issuer revoke kar sakta hai", async function () {
      await registry.authorizeIssuer(issuer.address, "IIT Bombay");
      await registry.revokeIssuer(issuer.address);
      const [, isAuthorized] = await registry.getIssuerInfo(issuer.address);
      expect(isAuthorized).to.be.false;
    });

    it("revoke ke baad issuer certificate register nahi kar sakta", async function () {
      await registry.authorizeIssuer(issuer.address, "IIT Bombay");
      await registry.revokeIssuer(issuer.address);
      await expect(
        registry.connect(issuer).addCertificate(
          sampleCertId, sampleHash, "", "Student", "Degree", 2023
        )
      ).to.be.revertedWith("Not an authorized issuer");
    });
  });

  // ==================== CERTIFICATE REGISTRATION ====================

  describe("Certificate Registration", function () {
    beforeEach(async function () {
      await registry.authorizeIssuer(issuer.address, "IIT Bombay");
    });

    it("authorized issuer certificate add kar sakta hai", async function () {
      await registry.connect(issuer).addCertificate(
        sampleCertId, sampleHash, "ipfsCID123", "Rahul Sharma", "B.Tech CS", 2023
      );
      const [found, isValid, certId] = await registry.verifyCertificate(sampleHash);
      expect(found).to.be.true;
      expect(isValid).to.be.true;
      expect(certId).to.equal(sampleCertId);
    });

    it("unauthorized user certificate add nahi kar sakta", async function () {
      await expect(
        registry.connect(randomUser).addCertificate(
          sampleCertId, sampleHash, "", "Student", "Degree", 2023
        )
      ).to.be.revertedWith("Not an authorized issuer");
    });

    it("duplicate hash reject hota hai", async function () {
      await registry.connect(issuer).addCertificate(
        sampleCertId, sampleHash, "", "Student", "Degree", 2023
      );
      await expect(
        registry.connect(issuer).addCertificate(
          sampleCertId2, sampleHash, "", "Student2", "Degree", 2023
        )
      ).to.be.revertedWith("Certificate hash already exists");
    });

    it("duplicate certId reject hota hai", async function () {
      await registry.connect(issuer).addCertificate(
        sampleCertId, sampleHash, "", "Student", "Degree", 2023
      );
      await expect(
        registry.connect(issuer).addCertificate(
          sampleCertId, sampleHash2, "", "Student2", "Degree", 2023
        )
      ).to.be.revertedWith("CertId already registered");
    });

    it("64 char se chhota hash reject hota hai", async function () {
      await expect(
        registry.connect(issuer).addCertificate(
          sampleCertId, "abc123", "", "Student", "Degree", 2023
        )
      ).to.be.revertedWith("Hash must be 64 characters (SHA-256)");
    });
  });

  // ==================== VERIFICATION ====================

  describe("Certificate Verification", function () {
    beforeEach(async function () {
      await registry.authorizeIssuer(issuer.address, "IIT Bombay");
      await registry.connect(issuer).addCertificate(
        sampleCertId, sampleHash, "ipfsCID123", "Rahul Sharma", "B.Tech CS", 2023
      );
    });

    it("valid certificate verify hota hai", async function () {
      const [found, isValid, certId, issuerName, student, degree, year] =
        await registry.verifyCertificate(sampleHash);
      expect(found).to.be.true;
      expect(isValid).to.be.true;
      expect(certId).to.equal(sampleCertId);
      expect(issuerName).to.equal("IIT Bombay");
      expect(student).to.equal("Rahul Sharma");
      expect(degree).to.equal("B.Tech CS");
      expect(year).to.equal(2023n);
    });

    it("unknown hash pe found=false aata hai", async function () {
      const [found] = await registry.verifyCertificate("c".repeat(64));
      expect(found).to.be.false;
    });

    it("getCertificateById se certId pe dhundh sakte hain", async function () {
      const [found, isValid, hash] = await registry.getCertificateById(sampleCertId);
      expect(found).to.be.true;
      expect(isValid).to.be.true;
      expect(hash).to.equal(sampleHash);
    });

    it("unknown certId pe found=false aata hai", async function () {
      const [found] = await registry.getCertificateById("UNKNOWN-ID");
      expect(found).to.be.false;
    });
  });

  // ==================== REVOCATION ====================

  describe("Certificate Revocation", function () {
    beforeEach(async function () {
      // Owner ko bhi authorize karo taaki revoke kar sake
      await registry.authorizeIssuer(issuer.address, "IIT Bombay");
      await registry.authorizeIssuer(owner.address, "Admin");
      await registry.authorizeIssuer(issuer2.address, "IIT Delhi");
      await registry.connect(issuer).addCertificate(
        sampleCertId, sampleHash, "", "Rahul Sharma", "B.Tech CS", 2023
      );
    });

    it("issuer apna certificate revoke kar sakta hai", async function () {
      await registry.connect(issuer).revokeCertificate(sampleCertId, "Degree rescinded");
      const [found, isValid] = await registry.verifyCertificate(sampleHash);
      expect(found).to.be.true;
      expect(isValid).to.be.false;
    });

    it("owner certificate revoke kar sakta hai", async function () {
      await registry.connect(owner).revokeCertificate(sampleCertId, "Admin action");
      const [, isValid] = await registry.verifyCertificate(sampleHash);
      expect(isValid).to.be.false;
    });

    it("dusra issuer revoke nahi kar sakta", async function () {
      await expect(
        registry.connect(issuer2).revokeCertificate(sampleCertId, "Unauthorized")
      ).to.be.revertedWith("Not authorized to revoke this certificate");
    });

    it("already revoked certificate dobara revoke nahi hoti", async function () {
      await registry.connect(issuer).revokeCertificate(sampleCertId, "First revoke");
      await expect(
        registry.connect(issuer).revokeCertificate(sampleCertId, "Second revoke")
      ).to.be.revertedWith("Already revoked");
    });

    it("CertificateRevoked event emit hota hai", async function () {
      await expect(
        registry.connect(issuer).revokeCertificate(sampleCertId, "Test reason")
      ).to.emit(registry, "CertificateRevoked");
    });
  });
});