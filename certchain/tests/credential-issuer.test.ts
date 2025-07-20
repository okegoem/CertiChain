import { describe, it, expect, beforeEach } from "vitest"

const mockCredentialIssuer = {
  institutionRegistry: {
    verified: new Set<string>(),

    isVerifiedInstitution(principal: string) {
      return this.verified.has(principal)
    }
  },

  credentialCounter: 0,
  credentials: new Map<number, any>(),

  issueCredential(sender: string, student: string, metadata: string) {
    if (!this.institutionRegistry.isVerifiedInstitution(sender)) {
      return { error: 101 } // ERR-NOT-VERIFIED
    }

    const id = ++this.credentialCounter
    this.credentials.set(id, {
      issuer: sender,
      student,
      metadata,
      active: true
    })

    return { value: id }
  },

  revokeCredential(sender: string, id: number) {
    const credential = this.credentials.get(id)
    if (!credential) return { error: 102 } // ERR-NOT-FOUND
    if (credential.issuer !== sender) return { error: 100 } // ERR-NOT-AUTHORIZED

    credential.active = false
    this.credentials.set(id, credential)
    return { value: true }
  },

  getCredential(id: number) {
    const credential = this.credentials.get(id)
    if (!credential) return { error: 102 }
    return { value: credential }
  }
}

describe("Credential Issuer Contract", () => {
  beforeEach(() => {
    mockCredentialIssuer.credentialCounter = 0
    mockCredentialIssuer.credentials = new Map()
    mockCredentialIssuer.institutionRegistry.verified = new Set([
      "ST1INSTITUTION"
    ])
  })

  it("should allow verified institution to issue credential", () => {
    const result = mockCredentialIssuer.issueCredential(
      "ST1INSTITUTION",
      "STUDENT1",
      "Bachelor of Blockchain Engineering"
    )
    expect(result).toHaveProperty("value", 1)

    const stored = mockCredentialIssuer.getCredential(1)
    expect(stored.value).toMatchObject({
      issuer: "ST1INSTITUTION",
      student: "STUDENT1",
      metadata: "Bachelor of Blockchain Engineering",
      active: true
    })
  })

  it("should prevent unverified institution from issuing", () => {
    const result = mockCredentialIssuer.issueCredential(
      "ST3UNVERIFIED",
      "STUDENT2",
      "Fake Degree"
    )
    expect(result).toEqual({ error: 101 })
  })

  it("should allow issuer to revoke their credential", () => {
    mockCredentialIssuer.issueCredential(
      "ST1INSTITUTION",
      "STUDENT3",
      "Masters in Crypto"
    )
    const revoke = mockCredentialIssuer.revokeCredential("ST1INSTITUTION", 1)
    expect(revoke).toEqual({ value: true })

    const credential = mockCredentialIssuer.getCredential(1)
    expect(credential.value.active).toBe(false)
  })

  it("should prevent others from revoking credential", () => {
    mockCredentialIssuer.issueCredential(
      "ST1INSTITUTION",
      "STUDENT4",
      "PhD in Solidity"
    )
    const revoke = mockCredentialIssuer.revokeCredential("ST4RANDOM", 1)
    expect(revoke).toEqual({ error: 100 })
  })

  it("should return error when revoking nonexistent credential", () => {
    const result = mockCredentialIssuer.revokeCredential("ST1INSTITUTION", 999)
    expect(result).toEqual({ error: 102 })
  })

  it("should return credential details", () => {
    mockCredentialIssuer.issueCredential(
      "ST1INSTITUTION",
      "STUDENT5",
      "Certificate in DeFi"
    )
    const result = mockCredentialIssuer.getCredential(1)
    expect(result.value.student).toBe("STUDENT5")
  })

  it("should error on unknown credential ID", () => {
    const result = mockCredentialIssuer.getCredential(999)
    expect(result).toEqual({ error: 102 })
  })
})
