# Auth

Own a future established-provider adapter and server-side admin authorization. The current session adapter always returns null; admin routes return 404. No credentials, invitations, provider integration, login, or sessions are implemented. Layout checks do not secure future APIs/actions: each must authorize independently. Resolve invitations and active status from trusted server records; verify MFA from provider claims.
