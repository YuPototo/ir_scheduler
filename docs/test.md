# Test

## Integration Test

To start testing:

1. `yarn db_up`: spawn test db
2. `yarn db_migrate_test`: prepare test db

When `prisma.schema` is updated in the middle of dev: run `yarn db-generate`: generate new prisma schema client.

To stop test db: `yarn db_down`
