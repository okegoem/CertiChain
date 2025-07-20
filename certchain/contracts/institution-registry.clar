;; Institution Registry Contract for CertiChain

(define-data-var admin principal tx-sender)

(define-map verified-institutions principal bool)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ALREADY-VERIFIED u101)
(define-constant ERR-NOT-FOUND u102)

;; Private helper: is caller admin?
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Public: Add institution
(define-public (add-institution (institution principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-none (map-get? verified-institutions institution)) (err ERR-ALREADY-VERIFIED))
    (map-set verified-institutions institution true)
    (ok true)
  )
)

;; Public: Remove institution
(define-public (remove-institution (institution principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-some (map-get? verified-institutions institution)) (err ERR-NOT-FOUND))
    (map-delete verified-institutions institution)
    (ok true)
  )
)

;; Read-only: Check institution status
(define-read-only (is-verified-institution (institution principal))
  (default-to false (map-get? verified-institutions institution))
)

;; Public: Transfer admin
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err ERR-NOT-AUTHORIZED))
    (var-set admin new-admin)
    (ok true)
  )
)
