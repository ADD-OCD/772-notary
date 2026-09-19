# Bookings

Own appointment lifecycle, availability, policy versions, location, and guest management. Tokens use 32 random bytes; store SHA-256 hashes only. Scheduling and token redemption are not implemented. Before writes, validate IANA timezones and DST, snapshot policy/service values, lock availability transactionally, and enforce expiry/revocation plus rate limits. Never log management URLs. Split overnight hours into local-day intervals.
