# Payments

Own provider adapters, payments/refunds, signature verification and durable idempotency. No provider selected and no integration exists. Use provider-hosted collection. Never store raw card data or webhook payloads. Before enabling: transactionally enforce refund totals, currency/amount matching, allowed state transitions, event replay/out-of-order handling, and retry-safe outgoing idempotency keys. Unique event IDs alone are not a complete webhook implementation.
