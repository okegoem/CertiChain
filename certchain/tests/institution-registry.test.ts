import { describe, it, expect, beforeEach } from "vitest"

const mockInstitutionRegistry = {
  admin: "ST1ADMIN1234567890ADMINADDRESS",
  verifiedInstitutions: new Map<string, boolean>(),

  isAdmin(caller: string) {
    return caller === this.admin
  },

  addInstitution(caller: string, institution: string) {
    if (!this.isAdmin(caller)) return { error: 100 } // ERR-NOT-AUTHORIZED
    if (this.verifiedInstitutions.has(institution)) return { error: 101 } // ERR-ALREADY-VERIFIED
    this.verifiedInstitutions.set(institution, true)
    return { value: true }
  },

  removeInstitution(caller: string, institution: string) {
    if (!this.isAdmin(caller)) return { error: 100 }
    if (!this.verifiedInstitutions.has(institution)) return { error: 102 } // ERR-NOT-FOUND
    this.verifiedInstitutions.delete(institution)
    return { value: true }
  },

  isVerifiedInstitution(institution: string) {
    return this.verifiedInstitutions.get(institution) ?? false
  },

  transferAdmin(caller: string, newAdmin: string) {
    if (!this.isAdmin(caller)) return { error: 100 }
    this.admin = newAdmin
    return { value: true }
  },
}

describe("Institution Registry Contract", () => {
  beforeEach(() => {
    mockInstitutionRegistry.admin = "ST1ADMIN1234567890ADMINADDRESS"
    mockInstitutionRegistry.verifiedInstitutions = new Map()
  })

  it("should add a new institution when called by admin", () => {
    const result = mockInstitutionRegistry.addInstitution(
      "ST1ADMIN1234567890ADMINADDRESS",
      "ST2INSTITUTION1111111111111111111111111111"
    )
    expect(result).toEqual({ value: true })
    expect(
      mockInstitutionRegistry.isVerifiedInstitution("ST2INSTITUTION1111111111111111111111111111")
    ).toBe(true)
  })

  it("should prevent non-admin from adding institution", () => {
    const result = mockInstitutionRegistry.addInstitution(
      "ST3UNAUTHORIZED",
      "ST2INSTITUTION1111111111111111111111111111"
    )
    expect(result).toEqual({ error: 100 })
    expect(
      mockInstitutionRegistry.isVerifiedInstitution("ST2INSTITUTION1111111111111111111111111111")
    ).toBe(false)
  })

  it("should not allow adding an already verified institution", () => {
    mockInstitutionRegistry.addInstitution(
      "ST1ADMIN1234567890ADMINADDRESS",
      "ST2INSTITUTION1111111111111111111111111111"
    )
    const result = mockInstitutionRegistry.addInstitution(
      "ST1ADMIN1234567890ADMINADDRESS",
      "ST2INSTITUTION1111111111111111111111111111"
    )
    expect(result).toEqual({ error: 101 })
  })

  it("should remove an existing institution by admin", () => {
    const inst = "ST2INSTITUTIONREMOVE123456789"
    mockInstitutionRegistry.addInstitution("ST1ADMIN1234567890ADMINADDRESS", inst)
    const result = mockInstitutionRegistry.removeInstitution(
      "ST1ADMIN1234567890ADMINADDRESS",
      inst
    )
    expect(result).toEqual({ value: true })
    expect(mockInstitutionRegistry.isVerifiedInstitution(inst)).toBe(false)
  })

  it("should not remove non-existing institution", () => {
    const result = mockInstitutionRegistry.removeInstitution(
      "ST1ADMIN1234567890ADMINADDRESS",
      "ST9UNKNOWNINSTITUTION"
    )
    expect(result).toEqual({ error: 102 })
  })

  it("should prevent non-admin from removing institution", () => {
    const inst = "ST2INST123"
    mockInstitutionRegistry.addInstitution("ST1ADMIN1234567890ADMINADDRESS", inst)
    const result = mockInstitutionRegistry.removeInstitution("ST4NOTADMIN", inst)
    expect(result).toEqual({ error: 100 })
  })

  it("should allow admin transfer", () => {
    const newAdmin = "ST9NEWADMIN"
    const result = mockInstitutionRegistry.transferAdmin(
      "ST1ADMIN1234567890ADMINADDRESS",
      newAdmin
    )
    expect(result).toEqual({ value: true })
    expect(mockInstitutionRegistry.admin).toBe(newAdmin)

    // New admin can now add an institution
    const addResult = mockInstitutionRegistry.addInstitution(
      newAdmin,
      "ST5NEWINSTITUTION"
    )
    expect(addResult).toEqual({ value: true })
  })

  it("should prevent non-admin from transferring admin rights", () => {
    const result = mockInstitutionRegistry.transferAdmin("ST7IMPOSTER", "ST9NEWADMIN")
    expect(result).toEqual({ error: 100 })
  })
})
