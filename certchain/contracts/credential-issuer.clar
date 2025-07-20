;; Credential Issuer Contract for CertiChain

(define-trait institution-registry-trait
  (
    (is-verified-institution (principal) (response bool uint))
  )
)

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-NOT-VERIFIED u101)
(define-constant ERR-NOT-FOUND u102)

(define-data-var credential-counter uint u0)

(define-map credentials
  uint
  {
    issuer: principal,
    student: principal,
    metadata: (buff 1024),
    active: bool
  }
)

(define-constant institution-registry 'ST000000000000000000002AMW42H.institution-registry) ;; replace with actual address

;; Public: Issue credential
(define-public (issue-credential (student principal) (metadata (buff 1024)))
  (begin
    (let ((verified (contract-call? institution-registry is-verified-institution tx-sender)))
      (match verified
        true
          (let ((id (+ (var-get credential-counter) u1)))
            (map-set credentials id {
              issuer: tx-sender,
              student: student,
              metadata: metadata,
              active: true
            })
            (var-set credential-counter id)
            (ok id)
          )
        false (err ERR-NOT-VERIFIED)
      )
    )
  )
)

;; Public: Revoke credential
(define-public (revoke-credential (id uint))
  (begin
    (match (map-get? credentials id)
      credential
        (begin
          (asserts! (is-eq tx-sender (get issuer credential)) (err ERR-NOT-AUTHORIZED))
          (map-set credentials id (merge credential { active: false }))
          (ok true)
        )
      none (err ERR-NOT-FOUND)
    )
  )
)

;; Read-only: Get credential details
(define-read-only (get-credential (id uint))
  (match (map-get? credentials id)
    credential (ok credential)
    none (err ERR-NOT-FOUND)
  )
)
