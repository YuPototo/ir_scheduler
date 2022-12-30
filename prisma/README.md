# On Prisma

`schema.prisma` file is copied directly from main project.

There is no need to run `prisma migrate` in this project, except for generating test db.

When running `prisma migrate` for test db, a `migrations` dir would be generated. That dir should be ignored by git.
