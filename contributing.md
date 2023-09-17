# Contributing Guide

Thanks for your interest in contributing to `rate-limit-memcached`! This guide
will show you how to set up your environment and contribute to this library.

## Set Up

First, you need to install and be familiar the following:

- `git`: [Here](https://github.com/git-guides) is a great guide by GitHub on
  installing and getting started with Git.
- `node` and `npm`:
  [This guide](https://nodejs.org/en/download/package-manager/) will help you
  install Node and npm. The recommended method is using the `n` version manager
  if you are on MacOS or Linux. Make sure you are using the
  [active LTS version](https://github.com/nodejs/Release#release-schedule) of
  Node.

Once you have installed the above, follow
[these instructions](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
to
[`fork`](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks)
and [`clone`](https://github.com/git-guides/git-clone) the repository
(`express-rate-limit/rate-limit-memcached`).

Once you have forked and cloned the repository, you can
[pick out an issue](https://github.com/express-rate-limit/rate-limit-memcached/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)
you want to fix/implement!

## Making Changes

Once you have cloned the repository to your computer (say, in
`~/Code/rate-limit-memcached`) and picked the issue you want to tackle, create a
branch based off the `next` branch:

```sh
> git switch next
> git switch --create branch-name
```

While naming your branch, make sure the name is short and self explanatory.

Once you have created a branch, you can start coding!

The library is written in
[Typescript](https://github.com/microsoft/TypeScript#readme) and supports Node
16, 18 and 20. The code is arranged as follows:

```sh
.
├── config
│  └── husky
│     └── pre-commit
├── source
│  ├── index.ts
│  ├── memcached-store.ts
│  └── types.ts
├── test
│  ├── options-test.ts
│  ├── store-test.ts
│  └── types.ts
├── changelog.md
├── contributing.md
├── jest.config.json
├── license.md
├── package-lock.json
├── package.json
├── readme.md
└── tsconfig.json
```

> Most files have a little description of what they do at the top.

#### `./`

- `package.json`: Node package information.
- `package-lock.json`: npm lock file, please do not modify manually.
- `tsconfig.json`: The TSC configuration for this project.
- `changelog.md`: A list of changes that have been made in each version.
- `contributing.md`: This file, helps contributors get started.
- `license.md`: Tells people how they can use this package.
- `readme.md`: The file everyone should read before using the package. Contains
  installation and usage instructions and the API reference.

#### `source/`

- `source/index.ts`: Exports the `MemcachedStore` function as a named export
  from `source/memcached-store.ts`, and types from `source/types.ts`.
- `source/memcached-store.ts`: The store itself.
- `source/types.ts`: Typescript types for the library.

#### `test/`

- `test/options-test.ts`: Ensures the library can parse options correctly.
- `test/store-test.ts`: Ensures the store works correctly with in various
  different situations.
- `test/types.ts`: Declares types for the tests.

#### `config/`

- `config/husky/pre-commit`: The bash script to run just before someone runs
  `git commit`.

### Documentation and testing

When adding a new feature/fixing a bug, please add/update the readme and
changelog as well as add tests for the same. Also make sure the codebase passes
the linter and library tests by running `npm test`. Note that running
`npm run format` will automatically resolve most style/lint issues.

Once you have made changes to the code, you will want to
[`commit`](https://github.com/git-guides/git-commit) (basically, Git's version
of save) the changes. To commit the changes you have made locally:

```sh
> git add this/folder that-file.js
> git commit --message 'commit-message'
```

While writing the `commit-message`, try to follow the below guidelines:

1. Prefix the message with `type:`, where `type` is one of the following
   dependending on what the commit does:
   - `fix`: Introduces a bug fix.
   - `feat`: Adds a new feature.
   - `test`: Any change related to tests.
   - `perf`: Any performance related change.
   - `meta`: Any change related to the build process, workflows, issue
     templates, etc.
   - `refc`: Any refactoring work.
   - `docs`: Any documentation related changes.
2. Keep the first line brief, and less than 60 characters.
3. Try describing the change in detail in a new paragraph (double newline after
   the first line).

When you commit files, `husky` and `lint-staged` will automatically lint the
code and fix most issues. In case an error is not automatically fixable, they
will cancel the commit. Please fix the errors before committing the changes. If
you still wish to commit the changes, prefix the `git commit` command with
`HUSKY=0`, like so:

```sh
> HUSKY=0 git commit --message 'commit-message'
```

## Contributing Changes

Once you have committed your changes, you will want to
[`push`](https://github.com/git-guides/git-push) (basically, publish your
changes to GitHub) your commits. To push your changes to your fork:

```sh
> git push origin branch-name
```

If there are changes made to the `next` branch of the
`express-rate-limit/rate-limit-memcached` repository, you may wish to merge
those changes into your branch. To do so, you can run the following commands:

```
> git fetch upstream next
> git merge upstream/next
```

This will automatically add the changes from `next` branch of the
`express-rate-limit/rate-limit-memcached` repository to the current branch. If
you encounter any merge conflicts, follow
[this guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line)
to resolve them.

Once you have pushed your changes to your fork, follow
[these instructions](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)
to open a
[`pull request`](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests):

Once you have submitted a pull request, the maintainers of the repository will
review your pull requests. Whenever a maintainer reviews a pull request they may
request changes. These may be small, such as fixing a typo, or may involve
substantive changes. Such requests are intended to be helpful, but at times may
come across as abrupt or unhelpful, especially if they do not include concrete
suggestions on how to change them. Try not to be discouraged. If you feel that a
review is unfair, say so or seek the input of another project contributor. Often
such comments are the result of a reviewer having taken insufficient time to
review and are not ill-intended. Such difficulties can often be resolved with a
bit of patience. That said, reviewers should be expected to provide helpful
feedback.

In order to land, a pull request needs to be reviewed and approved by at least
one maintainer and pass CI. After that, if there are no objections from other
contributors, the pull request can be merged.

#### Congratulations and thanks for your contribution!

<!-- This contributing guide was inspired by the Electron project's contributing guide. -->
