# @terminallyonline/cord

## 0.3.4

### Patch Changes

- 9449c57: ## 🔄 PR Details
  chore(deps-dev): bump esbuild from 0.20.2 to 0.25.0

  > Bumps [esbuild](https://github.com/evanw/esbuild) from 0.20.2 to 0.25.0.

  <details>
  <summary>Release notes</summary>
  <p><em>Sourced from <a href=https://github.com/evanw/esbuild/releases>esbuild's releases</a>.</em></p>
  <blockquote>
  <h2>v0.25.0</h2>
  <p><strong>This release deliberately contains backwards-incompatible changes.</strong> To avoid automatically picking up releases like this, you should either be pinning the exact version of <code>esbuild</code> in your <code>package.json</code> file (recommended) or be using a version range syntax that only accepts patch upgrades such as <code>^0.24.0</code> or <code>~0.24.0</code>. See npm's documentation about <a href=https://docs.npmjs.com/cli/v6/using-npm/semver/>semver</a> for more information.</p>
  <ul>
  <li>
  <p>Restrict access to esbuild's development server (<a href=https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99>GHSA-67mh-4wv8-2f99</a>)</p>
  <p>This change addresses esbuild's first security vulnerability report. Previously esbuild set the <code>Access-Control-Allow-Origin</code> header to <code>*</code> to allow esbuild's development server to be flexible in how it's used for development. However, this allows the websites you visit to make HTTP requests to esbuild's local development server, which gives read-only access to your source code if the website were to fetch your source code's specific URL. You can read more information in <a href=https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99>the report</a>.</p>
  <p>Starting with this release, <a href=https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS>CORS</a> will now be disabled, and requests will now be denied if the host does not match the one provided to <code>--serve=</code>. The default host is <code>0.0.0.0</code>, which refers to all of the IP addresses that represent the local machine (e.g. both <code>127.0.0.1</code> and <code>192.168.0.1</code>). If you want to customize anything about esbuild's development server, you can <a href=https://esbuild.github.io/api/#serve-proxy>put a proxy in front of esbuild</a> and modify the incoming and/or outgoing requests.</p>
  <p>In addition, the <code>serve()</code> API call has been changed to return an array of <code>hosts</code> instead of a single <code>host</code> string. This makes it possible to determine all of the hosts that esbuild's development server will accept.</p>
  <p>Thanks to <a href=https://github.com/sapphi-red><code>@​sapphi-red</code></a> for reporting this issue.</p>
  </li>
  <li>
  <p>Delete output files when a build fails in watch mode (<a href=https://redirect.github.com/evanw/esbuild/issues/3643>#3643</a>)</p>
  <p>It has been requested for esbuild to delete files when a build fails in watch mode. Previously esbuild left the old files in place, which could cause people to not immediately realize that the most recent build failed. With this release, esbuild will now delete all output files if a rebuild fails. Fixing the build error and triggering another rebuild will restore all output files again.</p>
  </li>
  <li>
  <p>Fix correctness issues with the CSS nesting transform (<a href=https://redirect.github.com/evanw/esbuild/issues/3620>#3620</a>, <a href=https://redirect.github.com/evanw/esbuild/issues/3877>#3877</a>, <a href=https://redirect.github.com/evanw/esbuild/issues/3933>#3933</a>, <a href=https://redirect.github.com/evanw/esbuild/issues/3997>#3997</a>, <a href=https://redirect.github.com/evanw/esbuild/issues/4005>#4005</a>, <a href=https://redirect.github.com/evanw/esbuild/pull/4037>#4037</a>, <a href=https://redirect.github.com/evanw/esbuild/pull/4038>#4038</a>)</p>
  <p>This release fixes the following problems:</p>
  <ul>
  <li>
  <p>Naive expansion of CSS nesting can result in an exponential blow-up of generated CSS if each nesting level has multiple selectors. Previously esbuild sometimes collapsed individual nesting levels using <code>:is()</code> to limit expansion. However, this collapsing wasn't correct in some cases, so it has been removed to fix correctness issues.</p>
  <pre lang=css><code>/* Original code */
  .parent {
    &gt; .a,
    &gt; .b1 &gt; .b2 {
      color: red;
    }
  }
  <p>/* Old output (with --supported:nesting=false) */<br />
  .parent &gt; :is(.a, .b1 &gt; .b2) {<br />
  color: red;<br />
  }</p>
  <p>/* New output (with --supported:nesting=false) */<br />
  .parent &gt; .a,<br />
  .parent &gt; .b1 &gt; .b2 {<br />
  color: red;<br />
  }<br />
  </code></pre></p>
  <p>Thanks to <a href=https://github.com/tim-we><code>@​tim-we</code></a> for working on a fix.</p>
  </li>
  <li>
  <p>The <code>&amp;</code> CSS nesting selector can be repeated multiple times to increase CSS specificity. Previously esbuild ignored this possibility and incorrectly considered <code>&amp;&amp;</code> to have the same specificity as <code>&amp;</code>. With this release, this should now work correctly:</p>
  <pre lang=css><code>/* Original code (color should be red) */
  </code></pre>
  </li>
  </ul>
  </li>
  </ul>
  <!-- raw HTML omitted -->
  </blockquote>
  <p>... (truncated)</p>
  </details>
  <details>
  <summary>Changelog</summary>
  <p><em>Sourced from <a href=https://github.com/evanw/esbuild/blob/main/CHANGELOG-2024.md>esbuild's changelog</a>.</em></p>
  <blockquote>
  <h1>Changelog: 2024</h1>
  <p>This changelog documents all esbuild versions published in the year 2024 (versions 0.19.12 through 0.24.2).</p>
  <h2>0.24.2</h2>
  <ul>
  <li>
  <p>Fix regression with <code>--define</code> and <code>import.meta</code> (<a href=https://redirect.github.com/evanw/esbuild/issues/4010>#4010</a>, <a href=https://redirect.github.com/evanw/esbuild/issues/4012>#4012</a>, <a href=https://redirect.github.com/evanw/esbuild/pull/4013>#4013</a>)</p>
  <p>The previous change in version 0.24.1 to use a more expression-like parser for <code>define</code> values to allow quoted property names introduced a regression that removed the ability to use <code>--define:import.meta=...</code>. Even though <code>import</code> is normally a keyword that can't be used as an identifier, ES modules special-case the <code>import.meta</code> expression to behave like an identifier anyway. This change fixes the regression.</p>
  <p>This fix was contributed by <a href=https://github.com/sapphi-red><code>@​sapphi-red</code></a>.</p>
  </li>
  </ul>
  <h2>0.24.1</h2>
  <ul>
  <li>
  <p>Allow <code>es2024</code> as a target in <code>tsconfig.json</code> (<a href=https://redirect.github.com/evanw/esbuild/issues/4004>#4004</a>)</p>
  <p>TypeScript recently <a href=https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/#support-for---target-es2024-and---lib-es2024>added <code>es2024</code></a> as a compilation target, so esbuild now supports this in the <code>target</code> field of <code>tsconfig.json</code> files, such as in the following configuration file:</p>
  <pre lang=json><code>{
    &quot;compilerOptions&quot;: {
      &quot;target&quot;: &quot;ES2024&quot;
    }
  }
  </code></pre>
  <p>As a reminder, the only thing that esbuild uses this field for is determining whether or not to use legacy TypeScript behavior for class fields. You can read more in <a href=https://esbuild.github.io/content-types/#tsconfig-json>the documentation</a>.</p>
  <p>This fix was contributed by <a href=https://github.com/billyjanitsch><code>@​billyjanitsch</code></a>.</p>
  </li>
  <li>
  <p>Allow automatic semicolon insertion after <code>get</code>/<code>set</code></p>
  <p>This change fixes a grammar bug in the parser that incorrectly treated the following code as a syntax error:</p>
  <pre lang=ts><code>class Foo {
    get
    *x() {}
    set
    *y() {}
  }
  </code></pre>
  <p>The above code will be considered valid starting with this release. This change to esbuild follows a <a href=https://redirect.github.com/microsoft/TypeScript/pull/60225>similar change to TypeScript</a> which will allow this syntax starting with TypeScript 5.7.</p>
  </li>
  <li>
  <p>Allow quoted property names in <code>--define</code> and <code>--pure</code> (<a href=https://redirect.github.com/evanw/esbuild/issues/4008>#4008</a>)</p>
  <p>The <code>define</code> and <code>pure</code> API options now accept identifier expressions containing quoted property names. Previously all identifiers in the identifier expression had to be bare identifiers. This change now makes <code>--define</code> and <code>--pure</code> consistent with <code>--global-name</code>, which already supported quoted property names. For example, the following is now possible:</p>
  <pre lang=js><code></code></pre>
  </li>
  </ul>
  <!-- raw HTML omitted -->
  </blockquote>
  <p>... (truncated)</p>
  </details>
  <details>
  <summary>Commits</summary>
  <ul>
  <li><a href=https://github.com/evanw/esbuild/commit/e9174d671b1882758cd32ac5e146200f5bee3e45><code>e9174d6</code></a> publish 0.25.0 to npm</li>
  <li><a href=https://github.com/evanw/esbuild/commit/c27dbebb9e7a55dd9a084dd151dddd840787490e><code>c27dbeb</code></a> fix <code>hosts</code> in <code>plugin-tests.js</code></li>
  <li><a href=https://github.com/evanw/esbuild/commit/6794f602a453cf0255bcae245871de120a89a559><code>6794f60</code></a> fix <code>hosts</code> in <code>node-unref-tests.js</code></li>
  <li><a href=https://github.com/evanw/esbuild/commit/de85afd65edec9ebc44a11e245fd9e9a2e99760d><code>de85afd</code></a> Merge commit from fork</li>
  <li><a href=https://github.com/evanw/esbuild/commit/da1de1bf77a65f06654b49878d9ec4747ddaa21f><code>da1de1b</code></a> fix <a href=https://redirect.github.com/evanw/esbuild/issues/4065>#4065</a>: bitwise operators can return bigints</li>
  <li><a href=https://github.com/evanw/esbuild/commit/f4e9d19fb20095a98bf40634f0380f6a16be91e7><code>f4e9d19</code></a> switch case liveness: <code>default</code> is always last</li>
  <li><a href=https://github.com/evanw/esbuild/commit/7aa47c3e778ea04849f97f18dd9959df88fa0886><code>7aa47c3</code></a> fix <a href=https://redirect.github.com/evanw/esbuild/issues/4028>#4028</a>: minify live/dead <code>switch</code> cases better</li>
  <li><a href=https://github.com/evanw/esbuild/commit/22ecd306190b8971ec4474b5485266c20350e266><code>22ecd30</code></a> minify: more constant folding for strict equality</li>
  <li><a href=https://github.com/evanw/esbuild/commit/4cdf03c03697128044fa8fb76e5c478e9765b353><code>4cdf03c</code></a> fix <a href=https://redirect.github.com/evanw/esbuild/issues/4053>#4053</a>: reordering of <code>.tsx</code> in <code>node_modules</code></li>
  <li><a href=https://github.com/evanw/esbuild/commit/dc719775b7140120916bd9e6777ca1cb8a1cdc0e><code>dc71977</code></a> fix <a href=https://redirect.github.com/evanw/esbuild/issues/3692>#3692</a>: <code>0</code> now picks a random ephemeral port</li>
  <li>Additional commits viewable in <a href=https://github.com/evanw/esbuild/compare/v0.20.2...v0.25.0>compare view</a></li>
  </ul>
  </details>
  <br />

  [![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=esbuild&package-manager=npm_and_yarn&previous-version=0.20.2&new-version=0.25.0)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

  Dependabot will resolve any conflicts with this PR as long as you don't alter it yourself. You can also trigger a rebase manually by commenting .

  [//]: # "dependabot-automerge-start"
  [//]: # "dependabot-automerge-end"

  ***

  <details>
  <summary>Dependabot commands and options</summary>
  <br />

  You can trigger Dependabot actions by commenting on this PR:

  - will rebase this PR
  - will recreate this PR, overwriting any edits that have been made to it
  - will merge this PR after your CI passes on it
  - will squash and merge this PR after your CI passes on it
  - will cancel a previously requested merge and block automerging
  - will reopen this PR if it is closed
  - will close this PR and stop Dependabot recreating it. You can achieve the same result by closing it manually
  - will show all of the ignore conditions of the specified dependency
  - will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
  - will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
  - will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)
    You can disable automated security fix PRs for this repo from the [Security Alerts page](https://github.com/Terminally-Online/cord/network/alerts).

  </details>

  ## 📝 Changes

  - chore(deps-dev): bump esbuild from 0.20.2 to 0.25.0 ([c9787cd](https://github.com/Terminally-Online/cord/commit/c9787cd6595103947cdfbafc16e8330282020dfa))

  ## 🔍 Additional Context

  - PR: [#46](https://github.com/Terminally-Online/cord/pull/46)
  - Branch: `dependabot/npm_and_yarn/esbuild-0.25.0`
  - Author: @dependabot[bot]
  - Files Changed: 2

  ## 📊 Stats

  ```diff
   2 files changed, 176 insertions(+), 156 deletions(-)
  ```

- 0f89c7c: ## 🔄 PR Details
  chore(deps-dev): bump vitest from 2.1.6 to 2.1.9

  > Bumps [vitest](https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest) from 2.1.6 to 2.1.9.

  <details>
  <summary>Release notes</summary>
  <p><em>Sourced from <a href=https://github.com/vitest-dev/vitest/releases>vitest's releases</a>.</em></p>
  <blockquote>
  <h2>v2.1.9</h2>
  <p>This release includes security patches for:</p>
  <ul>
  <li><a href=https://github.com/vitest-dev/vitest/security/advisories/GHSA-8gvc-j273-4wm5>Browser mode serves arbitrary files | CVE-2025-24963</a></li>
  <li><a href=https://github.com/vitest-dev/vitest/security/advisories/GHSA-9crc-q9x8-hgqq>Remote Code Execution when accessing a malicious website while Vitest API server is listening | CVE-2025-24964</a></li>
  </ul>
  <h3>   🐞 Bug Fixes</h3>
  <ul>
  <li>backport <a href=https://redirect.github.com/vitest-dev/vitest/issues/7317>vitest-dev/vitest#7317</a> to v2 - by <a href=https://github.com/hi-ogawa><code>@​hi-ogawa</code></a> in <a href=https://redirect.github.com/vitest-dev/vitest/pull/7318>vitest-dev/vitest#7318</a></li>
  <li>(backport <a href=https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest/issues/7340>#7340</a> to v2) restrict served files from <code>/__screenshot-error</code> - by <a href=https://github.com/hi-ogawa><code>@​hi-ogawa</code></a> in <a href=https://redirect.github.com/vitest-dev/vitest/pull/7343>vitest-dev/vitest#7343</a></li>
  </ul>
  <h5>    <a href=https://github.com/vitest-dev/vitest/compare/v2.1.8...v2.1.9>View changes on GitHub</a></h5>
  <h2>v2.1.8</h2>
  <h3>   🐞 Bug Fixes</h3>
  <ul>
  <li>Support Node 21  -  by <a href=https://github.com/sheremet-va><code>@​sheremet-va</code></a> <a href=https://github.com/vitest-dev/vitest/commit/92f7a2ad><!-- raw HTML omitted -->(92f7a)<!-- raw HTML omitted --></a></li>
  </ul>
  <h5>    <a href=https://github.com/vitest-dev/vitest/compare/v2.1.7...v2.1.8>View changes on GitHub</a></h5>
  <h2>v2.1.7</h2>
  <h3>   🐞 Bug Fixes</h3>
  <ul>
  <li>Revert support for Vite 6  -  by <a href=https://github.com/sheremet-va><code>@​sheremet-va</code></a> <a href=https://github.com/vitest-dev/vitest/commit/fbe5c39d><!-- raw HTML omitted -->(fbe5c)<!-- raw HTML omitted --></a>
  <ul>
  <li>This introduced some breaking changes (<a href=https://redirect.github.com/vitest-dev/vitest/issues/6992>vitest-dev/vitest#6992</a>). We will enable support for it later. In the meantime, you can still use <code>pnpm.overrides</code> or yarn resolutions to override the <code>vite</code> version in the <code>vitest</code> package - the APIs are compatible.</li>
  </ul>
  </li>
  </ul>
  <h5>    <a href=https://github.com/vitest-dev/vitest/compare/v2.1.6...v2.1.7>View changes on GitHub</a></h5>
  </blockquote>
  </details>
  <details>
  <summary>Commits</summary>
  <ul>
  <li><a href=https://github.com/vitest-dev/vitest/commit/c9e59a089d94642eea29a43f2ee1986a5afb99c6><code>c9e59a0</code></a> chore: release v2.1.9</li>
  <li><a href=https://github.com/vitest-dev/vitest/commit/e0fe1d81e2d4bcddb1c6ca3c5c3970d8ba697383><code>e0fe1d8</code></a> fix: backport <a href=https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest/issues/7317>#7317</a> to v2 (<a href=https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest/issues/7318>#7318</a>)</li>
  <li><a href=https://github.com/vitest-dev/vitest/commit/d69cc75698dd6dbeaed5c237ebb46ccd41bfb438><code>d69cc75</code></a> bump: 2.1.8</li>
  <li><a href=https://github.com/vitest-dev/vitest/commit/92f7a2ad18453343bfef1333af4b4c8191f72ec4><code>92f7a2a</code></a> fix: support Node 21</li>
  <li><a href=https://github.com/vitest-dev/vitest/commit/81ed45b3a46759ac5b8aaa3a5fad80767316c4ae><code>81ed45b</code></a> chore: release v2.1.7</li>
  <li><a href=https://github.com/vitest-dev/vitest/commit/fbe5c39d8891abcd91dc6b03720ee2b6c7678197><code>fbe5c39</code></a> fix: revert support for Vite 6</li>
  <li>See full diff in <a href=https://github.com/vitest-dev/vitest/commits/v2.1.9/packages/vitest>compare view</a></li>
  </ul>
  </details>
  <br />

  [![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=vitest&package-manager=npm_and_yarn&previous-version=2.1.6&new-version=2.1.9)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)

  Dependabot will resolve any conflicts with this PR as long as you don't alter it yourself. You can also trigger a rebase manually by commenting .

  [//]: # "dependabot-automerge-start"
  [//]: # "dependabot-automerge-end"

  ***

  <details>
  <summary>Dependabot commands and options</summary>
  <br />

  You can trigger Dependabot actions by commenting on this PR:

  - will rebase this PR
  - will recreate this PR, overwriting any edits that have been made to it
  - will merge this PR after your CI passes on it
  - will squash and merge this PR after your CI passes on it
  - will cancel a previously requested merge and block automerging
  - will reopen this PR if it is closed
  - will close this PR and stop Dependabot recreating it. You can achieve the same result by closing it manually
  - will show all of the ignore conditions of the specified dependency
  - will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)
  - will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)
  - will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)
    You can disable automated security fix PRs for this repo from the [Security Alerts page](https://github.com/Terminally-Online/cord/network/alerts).

  </details>

  ## 📝 Changes

  - chore(deps-dev): bump vitest from 2.1.6 to 2.1.9 ([5e50655](https://github.com/Terminally-Online/cord/commit/5e50655548fb2384e2299f671f1f1314d65589c7))

  ## 🔍 Additional Context

  - PR: [#47](https://github.com/Terminally-Online/cord/pull/47)
  - Branch: `dependabot/npm_and_yarn/vitest-2.1.9`
  - Author: @dependabot[bot]
  - Files Changed: 2

  ## 📊 Stats

  ```diff
   2 files changed, 187 insertions(+), 178 deletions(-)
  ```

## 0.3.3

### Patch Changes

- f6105b0: feat: type unions

## 0.3.2

### Patch Changes

- 7e01896: fix: add float to isEvmType

## 0.3.1

### Patch Changes

- c274157: feat: float type

## 0.3.0

### Minor Changes

- d1ba237: ## 🔄 PR Details
  feat: delete inputs when set to empty

  > No description provided.

  ## 📝 Changes

  - Merge branch 'main' into auto-delete-empty-values ([50ba959](https://github.com/Terminally-Online/cord/commit/50ba9599d39bb670ea071bf7547048f19e86d6e8))
  - chore: update changeset for PR #41 ([bcaa2e6](https://github.com/Terminally-Online/cord/commit/bcaa2e662c7cde34fe9862db1877155781a00d5c))
  - feat: delete inputs when set to empty ([b5f2f67](https://github.com/Terminally-Online/cord/commit/b5f2f67b7adaa1e1b2c23d46fb25b9e002e0cafc))

  ## 🔍 Additional Context

  - PR: [#41](https://github.com/Terminally-Online/cord/pull/41)
  - Branch: `auto-delete-empty-values`
  - Author: @nftchance
  - Files Changed: 3

  ## 📊 Stats

  ```diff
   3 files changed, 107 insertions(+), 15 deletions(-)
  ```

## 0.2.1

### Patch Changes

- a1af358: fix: export

## 0.2.0

### Minor Changes

- 3b0dd1c: ## 🔄 PR Details
  feat: hook cleanup

  > No description provided.

  ## 📝 Changes

  - chore: patch instead of minor ([043ebd3](https://github.com/Terminally-Online/cord/commit/043ebd3aeb8e8a4b18717916d1bbac5ae5a5512d))
  - chore: update changeset for PR #38 ([2bb03d0](https://github.com/Terminally-Online/cord/commit/2bb03d0d0ab185339344b6810b8636d2c26a6d35))
  - chore: update pnpm lock ([2dde3f2](https://github.com/Terminally-Online/cord/commit/2dde3f23f4b3ea2aed3a278b831bce22e325cd1d))
  - Merge branch 'fix-react-export' of https://github.com/Terminally-Online/cord into fix-react-export ([b7864db](https://github.com/Terminally-Online/cord/commit/b7864dbeaa6279387d7358a018dd505ca70ec0ae))
  - fix: remove all react references ([a3aef5a](https://github.com/Terminally-Online/cord/commit/a3aef5ab162c90296299e64c6d7c7702cc6db1b1))
  - chore: update changeset for PR #38 ([77111bb](https://github.com/Terminally-Online/cord/commit/77111bbc8e75c4c7ed9ef0fd25fb44ab63dba80a))
  - chore: proper changeset move ([23f8058](https://github.com/Terminally-Online/cord/commit/23f8058af83490398b0352395ca7dff60db233f9))
  - chore: update changeset for PR #38 ([8dbbf66](https://github.com/Terminally-Online/cord/commit/8dbbf6696e0c9397d23c9f382e69c367cb72a8fd))
  - feat: hook cleanup ([84fd743](https://github.com/Terminally-Online/cord/commit/84fd743a79fab7fcb2e42fa4cdaa97eca8662b08))

  ## 🔍 Additional Context

  - PR: [#38](https://github.com/Terminally-Online/cord/pull/38)
  - Branch: `fix-react-export`
  - Author: @nftchance
  - Files Changed: 20

  ## 📊 Stats

  ```diff
   20 files changed, 1109 insertions(+), 2469 deletions(-)
  ```

## 0.1.1

### Patch Changes

- 2eb9283: ## 🔄 PR Details
  fix: package export

  > No description provided.

  ## 📝 Changes

  - fix: package export ([27b6c72](https://github.com/Terminally-Online/cord/commit/27b6c72daef48c9165d5453b1ea01343d67125be))

  ## 🔍 Additional Context

  - PR: [#34](https://github.com/Terminally-Online/cord/pull/34)
  - Branch: `fix-package`
  - Author: @nftchance
  - Files Changed: 5

  ## 📊 Stats

  ```diff
   5 files changed, 55 insertions(+), 8 deletions(-)
  ```

- 2eb9283: ## 🔄 PR Details

  fix: package import

  > No description provided.

  ## 📝 Changes

  - Merge branch 'main' of https://github.com/Terminally-Online/cord into fix-package-import ([a6404d3](https://github.com/Terminally-Online/cord/commit/a6404d3ffdf6544a307bd7b21e40eb68336e58bf))
  - fix: package version ([f8715e6](https://github.com/Terminally-Online/cord/commit/f8715e6fd49de8fb725e886671477774c6446297))
  - fix: update lockfile ([72360ee](https://github.com/Terminally-Online/cord/commit/72360ee47d4d1968d207376069f845cf6740f9af))
  - fix: package build and exports ([1915ffe](https://github.com/Terminally-Online/cord/commit/1915ffe801eed5cb635ff9bd926d5a068ebdbb97))
  - Merge branch 'fix-package' of https://github.com/Terminally-Online/cord into fix-package ([9eecd2d](https://github.com/Terminally-Online/cord/commit/9eecd2de8de57f95b69aea450da27abe4b18feb5))
  - feat: ems and cjs exports ([efd93d4](https://github.com/Terminally-Online/cord/commit/efd93d4feb9053bef8593ccd9d0da48ca00e84ba))
  - chore: update changeset for PR #34 ([5738942](https://github.com/Terminally-Online/cord/commit/5738942588fedcad85a5b77e0979e4ec975e763e))
  - fix: package export ([27b6c72](https://github.com/Terminally-Online/cord/commit/27b6c72daef48c9165d5453b1ea01343d67125be))

  ## 🔍 Additional Context

  - PR: [#36](https://github.com/Terminally-Online/cord/pull/36)
  - Branch: `fix-package-import`
  - Author: @nftchance
  - Files Changed: 4

  ## 📊 Stats

  ```diff
   4 files changed, 292 insertions(+), 11 deletions(-)
  ```

## 0.1.0

### Minor Changes

- 9b83da3: ## 🔄 PR Details
  fix: package export

  > No description provided.

  ## 📝 Changes

  - Merge branch 'fix-package' of https://github.com/Terminally-Online/cord into fix-package ([9eecd2d](https://github.com/Terminally-Online/cord/commit/9eecd2de8de57f95b69aea450da27abe4b18feb5))
  - feat: ems and cjs exports ([efd93d4](https://github.com/Terminally-Online/cord/commit/efd93d4feb9053bef8593ccd9d0da48ca00e84ba))
  - chore: update changeset for PR #34 ([5738942](https://github.com/Terminally-Online/cord/commit/5738942588fedcad85a5b77e0979e4ec975e763e))
  - fix: package export ([27b6c72](https://github.com/Terminally-Online/cord/commit/27b6c72daef48c9165d5453b1ea01343d67125be))

  ## 🔍 Additional Context

  - PR: [#34](https://github.com/Terminally-Online/cord/pull/34)
  - Branch: `fix-package`
  - Author: @nftchance
  - Files Changed: 6

  ## 📊 Stats

  ```diff
   6 files changed, 84 insertions(+), 16 deletions(-)
  ```

## 0.0.11

### Patch Changes

- 8bb3f9b: ## 🔄 PR Details
  feat: automatic changeset on pr

  > No description provided.

  ## 📝 Changes

  - feat: better changeset message ([1925619](https://github.com/Terminally-Online/cord/commit/19256199fdc28805c8c5fc2667d19fda33719dcc))
  - chore: update changeset for PR #32 ([2b0e133](https://github.com/Terminally-Online/cord/commit/2b0e133cb6d7d4d4228c6c98efee1e2e2d4662d8))
  - Merge branch 'main' into changeset-on-pr ([0589f99](https://github.com/Terminally-Online/cord/commit/0589f99c1d67ea06a40e46917cc0f8bb4266e41f))
  - chore: update action name ([0ef0470](https://github.com/Terminally-Online/cord/commit/0ef0470437713053bd25e23b79a0a5f76d1937af))
  - chore: create changeset on pr open and sync ([c95a526](https://github.com/Terminally-Online/cord/commit/c95a5265193001259121976544f41e50e8ef639b))
  - Merge branch 'main' into changeset-on-pr ([1b72f5d](https://github.com/Terminally-Online/cord/commit/1b72f5d96b8f9d64098cfc82f26fe424913f9f64))
  - chore: update changeset ([76d1c5a](https://github.com/Terminally-Online/cord/commit/76d1c5a2f9a6dfb34cd01aa6a6f6974f46f50ff0))
  - feat: automatically create changeset on pr merge ([d7c8e8f](https://github.com/Terminally-Online/cord/commit/d7c8e8f8c730904c9029a6cda7432871fb087113))

  ## 🔍 Additional Context

  - PR: [#32](https://github.com/Terminally-Online/cord/pull/32)
  - Branch: `changeset-on-pr`
  - Author: @nftchance
  - Files Changed: 1

  ## 📊 Stats

  ```diff
   1 file changed, 35 insertions(+), 18 deletions(-)
  ```

## 0.0.10

### Patch Changes

- 62e4109: chore: make playground private

## 0.0.9

### Patch Changes

- 3661766: fix: build action

## 0.0.8

### Patch Changes

- 1f4e059: fix: build action

## 0.0.7

### Patch Changes

- da7e6a2: fix: remove playground from build

## 0.0.6

### Patch Changes

- c9ad421: fix: build steps

## 0.0.5

### Patch Changes

- 236e527: fix: release visibility

## 0.0.4

### Patch Changes

- 89bf34c: fix: publish action with inline build

## 0.0.3

### Patch Changes

- de2651d: feat: confirm functional release

## 0.0.2

### Patch Changes

- 4e99263: feat: confirm functional release pipeline

## 0.0.1

### Patch Changes

- feat: initial version
- fix: attach build files
- feat: null fields and improved hook

## 0.0.2

### Patch Changes

- feat: initial version

## 0.0.1

### Patch Changes

- feat: initial version
