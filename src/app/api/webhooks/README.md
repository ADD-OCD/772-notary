# Future provider webhooks

No HTTP endpoint exists yet. Select a provider separately. Verify signatures against the
raw request body before processing. Persist only provider/event IDs and safe processing
metadata, not raw payloads. Atomically claim unique (provider, event ID) records and commit
financial changes with processing state; retry failures and tolerate out-of-order events.
