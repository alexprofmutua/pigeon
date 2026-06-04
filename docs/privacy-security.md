# Privacy And Security

How we protect users and our codebase from day one.

## Security Rules From Day One

- We keep the repository private during early development.
- We use two-factor authentication on GitHub.
- We never commit `.env` files, API keys, tokens, private scans, or real user data.
- We store secrets in environment variables or a secret manager.
- We use least-privilege access for each of us on GitHub and hosting.
- We review code before merging.

## User Data We Protect

- Scoresheet images.
- Player names.
- Event names.
- Game history.
- Account information.
- Any payment information if we add subscriptions later.

## Upload Safety

- We restrict accepted file types.
- We limit upload size.
- We rename uploads safely.
- We store files outside the public app directory.
- We scan or validate uploads before processing when the app becomes public.

## Privacy Defaults

- Games are private by default.
- Users choose what to export or share.
- Bulk tournament data requires organizer permission.
- Real scoresheets used for training require consent.

## Future Security Checklist

- Authentication.
- Role-based permissions.
- HTTPS.
- Rate limiting.
- Backups.
- Audit logs for organizer accounts.
- Privacy policy.
- Terms of service.
- Data deletion flow.

## Important Note

We will not promise perfect privacy if we store user data online. We will explain clearly what is stored, who can see it, and how users can delete it.
