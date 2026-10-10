# Option Compatibility Regression

Verified on 2026-10-10 using Node v24.14.0, Mocha, jsdom, and headless Chrome through the existing Puppeteer dependency. The initial audit reproduced 39 failing assertions; runtime fixes and additional workflow regressions are now included in the normal test/build gate.

## Results

- All 18 top-level `defaultOptions` keys were included: 153 unordered pairs and 830 representative value combinations. All combinations passed the configuration and supported-workflow matrix, plus one coverage-completeness assertion.
- The complete compatibility suite has 5,848 passing tests and no failures.
- The DOM suite has 5,677 passing tests; the browser suite has 171 passing tests.
- The existing unit/integration baseline remains green: 270 passing.
- All 72 real export checks passed: JSON/UL/family sources, four directions, scales 1/2/3, and PNG/PDF. Scale-3 checks also enable navigation/export options, perform pan/zoom, and click the export button; family cases enable compact layout. Canvas dimensions, all six node colors, PDF headers/page dimensions, filenames, and export-state cleanup are checked.
- All 128 assignments of seven boolean switches are tested on three datasource types, four directions and three depths: 4,608 structural configurations.
- A verified 64-profile covering array exercises every one of the eight binary assignments of every triple among 26 public options (2,600 triples), using two representative values per option on JSON/UL/family sources.
- Twenty real-browser batches execute 128 switch masks each: 2,560 expand/zoom/pan/drag/reconfigure/export workflows across JSON, UL, family, hybrid and compact-data sources in four directions.

The configuration matrix is accompanied by actual browser, lifecycle and data-mutation checks. Coverage uses representative valid configurations, not arbitrary invalid values or every possible Cartesian product.

## Reproduction

Run the full regression suite:

```sh
npm run compatibility-tests
```

The suite is included in `gulp test` and `npm run build`. It must pass; known conflicts are no longer expected failures. No development server is required for the Puppeteer cases.

Run only the passing pairwise matrix:

```sh
npx mocha test/compatibility/options.tests.js --grep "pairwise" --reporter dot
```

Run the real export checks:

```sh
npx mocha test/compatibility/browser.tests.js --grep "actual PNG and PDF export pixels"
```

Run the existing baseline:

```sh
npx mocha "test/unit/*.js" "test/integration/*.js" --reporter dot
```

## Resolved Findings

| ID | Configuration / action | Fix |
| --- | --- | --- |
| F01 | Non-default direction with zoom or minimap movement | Preserve the complete rotation/reflection matrix and adjust only scale/translation. |
| F02 | Custom `nodeId` with hybrid drag/drop | Use the configured identifier for source and target datasource lookups. |
| F03 | Wheel over minimap with zoom enabled | Handle the event once and stop propagation to the container. |
| F04 | Repeated initialization or disabling zoom | Unbind old chart/container/document listeners before replacing the chart; retain merged option state. |
| F05 | Minimap with hidden nodes or limited depth | Filter nodes by their own and their ancestors' visibility; refresh on mutations and resize. |
| F06 | First pan movement with minimap | Refresh on the first matrix assignment as well as later moves. |
| F07 | Drag preview after direction/zoom changes | Measure scale from the full matrix instead of one direction-dependent entry. |
| F08 | Multiple instances with export buttons | Own each button by its chart instance, including loading-state isolation. |
| F09 | Updating or disabling an export button | Update the existing label or remove the instance's button during initialization. |
| F10 | Multiple chart class tokens during export | Match class tokens without building an invalid descendant selector; reuse the anchor. |
| F11 | Native scrolling with minimap | Listen for scrolling and keep both the overlay and viewport synchronized. |

Additional regressions cover compact drag/drop and editing, hierarchy queries, vertical/hybrid depth limits, nested event routing, pinch-state changes, loading styles, templates and callbacks. Minimap previews are checked after compact expansion animations; pan preserves fractional translations introduced by zoom.

Compact and family moves update the datasource and rebuild affected chart layout while retaining expansion and navigation state. They move the selected node and its own descendants, never the surrounding manager or household. Callers should reacquire rendered node elements after a rebuild.

Family regressions check configured identifiers, one-based depth, grouped hierarchy export, complete sibling queries, per-parent container isolation and independent expansion. Editing regressions verify that addChildren/addDescendants/addParent/addSiblings/removeNodes retain their results when options subsequently change. Initialization observers are cleaned up so immediate reconfiguration does not duplicate initCompleted callbacks.

## Configuration Rules

### Partial Icons

`icons` is merged field by field with the defaults. All 11 individual overrides are tested, together with complete custom objects.

### Zoom Limits

The supported scale interval is inclusive: `zoomoutLimit <= targetScale <= zoominLimit`. Wheel steps multiply by `0.8` or `1.2` and clamp to the configured bounds. Limits must be finite, positive and ordered.

Both container zoom and minimap zoom are checked:

| Limits | Result from scale `1` |
| --- | --- |
| `zoomoutLimit=0.8`, `zoominLimit=1.2` | Steps reach both boundaries. |
| `zoomoutLimit=0.9`, `zoominLimit=1.1` | Steps clamp to both boundaries. |
| `zoomoutLimit=2`, `zoominLimit=1` | A RangeError is thrown before replacing the chart. |

`compact` accepts boolean values, a branch-selection callback, or per-node data properties. `drag` aliases `draggable`; the canonical option wins when both are supplied. `visibleLevel` accepts nonnegative integers, `true` for the default depth, and `false` for one level.

Vertical/hybrid rules take precedence at nodes where configured; compact layout applies to other branches. A node does not render two different child layouts at once, but depth limits and interactions use the same actual hierarchy in either layout.

`minimap=true` intentionally supports its own wheel zoom even when `zoom=false`; the README documents this, so it is not counted as a conflict.

## Representative Values

| Option | Values checked in the pairwise matrix |
| --- | --- |
| `icons` | Complete defaults; complete custom class-name object |
| `nodeTitle` | `name`, `label` |
| `nodeId` | `id`, `key` |
| `toggleSiblingsResp` | `false`, `true` |
| `visibleLevel` | `1`, `2`, `999` |
| `chartClass` | Empty; one token; two tokens |
| `exportButton` | `false`, `true` |
| `exportButtonName` | `Export`, `Save Chart` |
| `exportFilename` | `OrgChart`, `compat-export` |
| `exportFileextension` | `png`, `pdf`, `PDF` |
| `exportScale` | `1`, `2`, `3` |
| `draggable` | `false`, `true` |
| `direction` | `t2b`, `b2t`, `l2r`, `r2l` |
| `pan` | `false`, `true` |
| `minimap` | `false`, `true` |
| `zoom` | `false`, `true` |
| `zoominLimit` | `2.5`, `7` |
| `zoomoutLimit` | `0.5`, `0.6` |

Each matrix case uses a fresh six-node JSON tree and checks merged options, labels/IDs, classes/icons, initial visibility, sibling collapse/reveal, pan enablement, container zoom enablement, horizontal drag/reparenting when enabled, and export routing/options/button behavior. Export rendering is stubbed only in the DOM suite; the browser suite uses the actual html2canvas/jsPDF implementations.

## Scope Limits

- All seven selected boolean switches are enumerated. Other values and callbacks use finite representatives; the full Cartesian product of every public option and every possible number/string/function is not asserted.
- Browser tests use 1280px and 390px viewport widths for selected minimap checks. Pinch-state transitions and drag events are programmatic; OS drag feedback and actual download dialogs are not asserted.
- Structural switch and triple-profile coverage includes JSON, native UL and grouped family sources. Browser workflows additionally include hybrid and compact data; arbitrary AJAX callbacks and external assets are outside the finite configuration matrix.
- Custom icon checks verify configuration and DOM classes, not external icon-font assets. Complete export checks verify node-color presence rather than screenshot-perfect typography.
- The existing unit/integration suite remains a separate regression gate. The standard build also runs Cypress demo tests.
