## Latest increment — clickable field tracing completed
- Added inspector-traces.js. Click row field labels or choose Origin, B attachments, source product ID, Application ID, registration ID, licence ID, actual profile ID or selected prerequisite ID. Four-stage trace links request identity, Java mapping/save, Kafka association and Profile row.
- Stage controls open linked Java evidence, current request/Kafka panel or relevant Profile table. Table selection, inspector field outlines, ER related-table accents, Java token-line highlights and path-aware B JSON highlights synchronize. Trace persists per family/operation/scenario across checkpoints; clear restores table-oriented view.
- B-only message matching excludes A product entries and shared root attachments. Generated registration/licence IDs are distinguished from source IDs. DR08/09 omitted Application product IDs and absent source-pair snapshot columns are explicit gaps. Actual resolver profile 99 is distinguished from prerequisite 42.
- Named Application mapper methods included: DR06 updateProduct, DR08 toProduct, DR09 toEntity. Two exact pinned mapper excerpts added, 214 total source snippets verified. Field trace is full lifecycle reference; current checkpoint may not have reached later stages. Missing subservice contracts reference original main registration only.
- Chrome verified 144 desktop/mobile trace selections across 3 families × success/validation/rollback scenarios × 8 traces × 2 widths. Checks cover row-label click, highlighted source/JSON/ER, trace persistence, clearing, B-only matching, source-ID omissions and all four stage controls.
- All 254 guided desktop/mobile views passed regression with evidence expanded. 41 scripts pass syntax; 42 asset hashes match. Screenshot /tmp/moh-clickable-field-trace.png visually inspected.
- Local source-derived examples only. Runtime requests/database mutations/Kafka sends remain unexecuted. Browser verification used approved loopback access to existing isolated Chrome after sandbox permissions changed.

## Latest increment — before/after field inspector
- Added row-inspector.js and field inspector inside synchronized ER for every guided checkpoint. Table dropdown and ER selection synchronize both directions, linked Java mapping source, Kafka key highlights and row ledger outlines. Explicit table selection persists across checkpoints per family/operation/scenario in page memory.
- Three columns: stored before checkpoint, transaction view/discarded work, stored at checkpoint end. Pending inserts/status edits do not appear committed until actual modelled commit checkpoint. ROW ABSENT distinct from SQL null; unspecified/unmodelled field subsets disclosed.
- Fixture subset includes Application id/status/payment/tracking, shared prerequisite FK, B product identity/origin/example files, profile id/status, registration/licence associations and snapshot source pair (DR06) or DR07 reference (DR08). All IDs/values are illustrative, not queried database rows. Attachment entries are selected examples, not full checklist.
- Covers DR06 draft pending→commit, AWAITING_PAYMENT pending→commit, paid/finalized commit, approval pending→commit; DR08/09 summary commit boundaries with explicit payment-summary note. Approval segment starts at external-review REVIEW precondition.
- Validation example null tracking → DEMO-TRACK-NEW pending → null restored. Profile failure preserves earlier APPROVED Application. Exact B assignments during injected failure unspecified, so no fabricated pending B row. Existing profile enrichment fields outside id/status subset disclosed.
- Missing subservice wiring shows retained original registration fields and creates no new operation rows. No request cardinality or successful subservice mutation inferred.
- Chrome model assertions covered 889 table/checkpoint states, 126 desktop/mobile inspector selections, 308 ER selection regressions, explicit table persistence, selected insert/commit/status/rollback outcomes. All 254 guide views passed with panels expanded. 40 scripts and 41 asset hashes pass; 212 pinned source excerpts still match Git.
- Screenshot /tmp/moh-row-inspector.png inspected. Local source-derived teaching fixtures only; no live database query/write or deployment.

## Latest increment — synchronized ER in guided lifecycle
- Added guide-er.js to every guided checkpoint. Seven selectable tables: Application parent/shared detail/B product and Profile establishment/registration/licence/B snapshot. Diagram automatically selects accessed tables for current step, shows row state and highlights local FK connections.
- Verified local model joins: detail PK/FK application_id, product application_id, registration license_id/profile_id, licence profile_id, snapshot registration_id PK/FK and profile_id. Prerequisite 42 and cross-service source IDs are explicitly references/message data, not cross-database FKs. Profile 99 remains an illustrative resolver outcome.
- State models cover draft pending/commit, submit waiting/paid/submitted, Application approval, Profile pending/commit, validation rollback, injected B failure with A pending work, and missing strategy with no domain writes. Schema nodes remain visible before rows exist.
- Orange approval link brightens at approval handoff checkpoints. DR06 source pair (700,802) contrasted with omitted DR08/09 Application product IDs. Clicking a table updates selected row state/keys, local relationship descriptions, linked mapping source and matching request/Kafka key highlights. Related ledger rows outlined where labels match. Java and data buttons jump to linked panels.
- Diagram fits desktop and scrolls internally on mobile. Fixed long selected-table/source text wrapping. Added accessible native table buttons with aria-pressed and labelled scroll region.
- Existing 212 exact Git excerpts reverified. 39 scripts and 40 asset hashes pass. Chrome checked all 254 desktop/390px guide views with evidence expanded. Additional 308 table selections across success/failure/missing states verify FK highlight, selected Java/data, row states, approval activation and linked panel controls.
- Screenshot /tmp/moh-guided-er.png inspected after desktop sizing adjustment. Source-derived fictional fixtures only; no live database mutation, Kafka send or deployment.

## Latest increment — guided lifecycle mode
- Entry #lifecycle-guide/DR06/DR06/success/0, linked as Start guided mode on every lifecycle operation. Family and operation selectors, scenario selector for main registrations, Previous/Next and map/detail links.
- Reuses DR06 29 core-flow checkpoints and DR08/DR09 10-step models, with Java chains, pinned sources, selected request/decoded Kafka fields and row-state highlights. Shared registration fixtures distinguish earlier Application commit from pending Profile result writes. DR08/09 ISSUE data explicitly describes licence selection assumptions.
- Main scenarios success, submit-validation failure and injected Profile runtime rollback. Failure phase allows only inspecting outcome, then restart/scenario selection. Subservice guides have existing result, missing-strategy pause and saved-row outcome, with no invented successful continuation.
- A separately injected unsupported Profile approval is distinguished from a message emitted by failed Application routing. Generic resolver gap has an explicit continue-with-gap control. Missing subservice certificate/cardinality remains unresolved.
- Rows highlight changed or newly shown labels. A save is pending until its transaction commits; Profile rollback preserves earlier Application approval. Review outcomes/payment continuation assumptions disclosed at bridges.
- Existing 212 exact Git excerpts reverified. 38 scripts pass syntax; all 39 asset hashes match. Chrome checked 254 desktop/390px guided views with evidence expanded, all 23 map entry links, scenario and operation selectors, failure/missing pauses, terminal controls and direct reload. Fixed narrow-screen source-summary wrapping.
- Screenshot /tmp/moh-guided-lifecycle.png inspected. Local simulation only; no live MOH request, database rollback, Kafka delivery or deployment executed.

## Latest increment — interactive Product B lifecycle map
- Entry #lifecycle/DR06/DR06/0, first core home entry. Every explorer service has a lifecycle link. Family tabs DR06/08/09, main registration → existing B → renewal/change/FSC/cancellation branches, each with detailed lesson and master-data links.
- All 23 services selectable with three row phases each. Registration distinguishes no new rows, earlier Application APPROVED plus pending Profile writes, and Profile commit. Subservices show existing result, isolated unsupported strategy attempt and surviving rows; no successful runtime mutation invented.
- Operation intent shown separately from inspected row outcome. Selected registration/licence/snapshot IDs, prerequisite 42 vs illustrative profile 99, original source identity and family-specific gaps displayed. DR06 source pair contrasted with absent source product IDs in DR08/09 approval maps.
- Master certificate values reread for inventory: main Product Number, all subservice types absent. No subservice cardinality model chosen. Runtime eligibility and allowed combinations remain open. Branches show relationships, not a forced sequential lifecycle.
- Existing pinned Java/SQL evidence and lesson data reused. No runtime changes or business writes. 37 scripts pass syntax, 38 asset hashes match.
- Chrome checked 138 desktop/390px views with sources expanded, all 23 explorer entries and detailed links, operation branch click, phase navigation/reload, three family tabs, nine registration row states and jump-to-rows button.
- Screenshot /tmp/moh-product-b-lifecycle.png inspected. Local source-derived fixtures; actual Kafka delivery and deployed outcomes remain unexecuted.

## Latest increment — complete 23-service lesson coverage
- User requested continuation through all services in approved inventory. All 3 main services + 20 subservices now have lesson links in the explorer. Runtime implementation completeness is explicitly separate from learning coverage.
- Added #service-lesson/DR08.02/0, DR08.08 and all DR09.01–DR09.07 via one shared six-checkpoint renderer with service-specific fields, requirements, source references, before/proposal/after rows and gaps.
- Read all remaining masters before analysis. All subservice certificate types absent; no request cardinality selected. Draft forms/readmes reviewed: DR08 combined reason-in-document and FSC shared main-form inventory; DR09 combined code mismatches, renewal conditional checklist, variation documents, cancellation reason and own FSC export/composition form.
- Application declares DR09 R/U/T + update section constants; Profile declares R/U/T, but no dedicated subservice strategies found in family modules/Java/SQL references. DR08 T declared only in Application, no dedicated handler. No dedicated family FSC code/strategy found. Food GDHT-FS-L remains separate.
- Interactive proposal inputs with per-field inclusion. DR09 direct product/MAH/manufacturer fields contrasted with DR08 DR07 enrichment; packaging design/material absent from snapshot. FSC output association and renewal date/history/number policies unresolved. No successful mutation is fabricated.
- Cancellation comparison includes conditional current BaseTerminateHandler whole-profile/all-open-licence commit scope, separately from no-write unsupported subservice handling. Shared renewal/update frameworks linked to existing simulators and their limitations.
- Three pinned source snippets added, 212 total exact Git matches. 36 scripts pass syntax; all 37 asset hashes checked, including digit-containing DR06/08/09 filenames. Chrome tested 108 new desktop/390px views with evidence expanded, every proposal input/edit/escaping/disable control, all 23 explorer-to-lesson entries, cancellation scope and direct reload.
- Screenshot /tmp/moh-all-service-lessons.png inspected. Local only; runtime refactors remain paused. Source-predicted fixtures do not execute live service requests, database writes or Kafka delivery.

## Latest increment — DR08 dosage form / appearance change
- Route #dr08-change/dosage/0, seven checkpoints. Extended existing shared name/packaging lesson rather than creating a duplicated renderer. Explorer DR08.07, core home and peer change navigation linked.
- Read DR08.07 master first. Type of certificate absent, parent Product Number. No subservice cardinality/model chosen. Fee 300000, new duration 20 days, same-as-original validity recorded. Combined form draft and reviewed DR08.07 implementation contract inspected.
- Application GDHT-TM-UDF declared; no dedicated Application/Profile DR08 update strategy found. Existing dosageForm copied from first referenced DR07 brand-name record by main-registration handler, then mapped to snapshot. Dedicated appearance field absent in inspected snapshot entity.
- Local proposal controls cover dosage_form and separately labelled unresolved appearance proposal. Rows compare original/proposed/final unsupported-code result, registration/licence/DR07 associations, composition and missing history. Composition permission is not inferred from appearance/dosage scope. Example capsule/tablet values do not establish allowed business transformation.
- Same source-verified Application factory exception and Profile catch/return boundaries. Shared update-helper condition and transaction caveat reused. Dedicated target, DR07 authority, field whitelist, evidence, mutation/history, number/output and replay policies remain unresolved.
- 35 scripts pass syntax, all 209 pinned excerpts reverified. Chrome checked 14 desktop/390px dosage views with source expanded, escaped edits, surviving fields, Next, explorer link and direct reload. All 28 existing name/packaging views passed regression checks after shared renderer extension.
- Screenshot /tmp/moh-dr08-dosage.png inspected. Local source-based fixtures only, no live mutation, runtime refactor or deployment.

## Latest increment — DR08 holder/manufacturer changes
- Routes #dr08-party/holder/0 and #dr08-party/manufacturer/0, six checkpoints each. Explorer cards DR08.05/.06 and core home linked.
- Both master files read before analysis. Exact Type of certificate absent, parent Product Number. No subservice cardinality/model chosen. Fee 300000, duration 20 days, same-as-original validity retained as master-data facts.
- Inspected Application f89d2061 and Profile a9caf9a; relevant module files match HEAD. UM/UMF declared only in Application constants. No dedicated DR08 update strategies/classes found. Reviewed roadmaps remain plans; combined form draft/unconfirmed.
- Holder fields supplied directly by DR08 product request/approved form data. Manufacturer fields omitted from request and enriched from first DR07 brand-name record at registration consumption. Both copied into snapshot by mapper. Lessons explain this difference and unresolved DR07 amendment authority/refresh.
- Interactive name-only/address-only/both proposals, existing read-only values, before/proposal/after table with B registration/licence, A rows, profile associations, DR07 and future history. Original values survive isolated unsupported-code boundaries. No successful amendment mutation asserted.
- Dedicated target ownership/version, per-product evidence, allowed combined operations, history/number/output, rollback and duplicate policies remain missing. Shared update-helper ACTIVE comparison/transaction caveat linked to previous lesson.
- Existing 209 Git-pinned excerpts reverified. 35 scripts pass syntax. Real Chrome checked 24 desktop/390px views with evidence expanded, six scope/disabled-control combinations, escaped editing, Next, explorer entry and reload. Additional assertions verify each proposed field and original before/after values across six scopes.
- Screenshot /tmp/moh-dr08-holder-manufacturer.png inspected. Local teaching fixtures; no live mutation, runtime refactor or deployment.

## Latest increment — DR08 product-name and packaging changes
- Routes #dr08-change/name/0 and #dr08-change/packaging/0, seven checkpoints each, linked from DR08.03/.04 explorer and core home.
- Read each master first. Type of certificate absent, parent Product Number. No cardinality chosen. Each records 300000, 20 days, validity same as original. Draft combined form and reviewed roadmap contracts inspected and distinguished from runtime implementation.
- Application f89d2061 declares GDHT-TM-U / UPN / UP but no Java/SQL use outside constants was found. Dedicated Application/Profile DR08 update strategies absent in inspected trees. Profile constants describe future U routing but expose registration only.
- Existing product_name and pack_size copied from first DR07 brand-name record during main registration. New DR07 approval/authority/refresh timing unresolved for amendments. Packaging design/material have no dedicated fields in inspected snapshot entity; controls explicitly show business proposals with unresolved DTO/persistence.
- Interactive proposals show initial fields, proposed values, existing registration/licence/DR07 associations, and rows surviving isolated unsupported-code handling. No successful amendment or history mutation is claimed. Original validity/history constraints attributed to reviewed plan.
- Shared BaseUpdateHandler inspected. resolveLicense returns a profile; base validateUpdate rejects status == ACTIVE with contradictory Profile is not active text. Interactive status example exposes exact behaviour. Base handle has no transaction annotation, so eventual caller/subclass transaction must be checked before claiming rollback. No runtime fixes performed.
- One exact source excerpt added; all 209 pinned excerpts verify. 34 scripts pass syntax. Chrome checked 28 desktop/390px views with source expanded, name/pack-size/design/material edits, escaping, status example, Next, both explorer entries and direct reload.
- Screenshot /tmp/moh-dr08-name-packaging.png inspected. Local source-based fixtures only, no live mutation, runtime refactor or deployment.

## Latest increment — DR08 renewal lesson
- Entry #dr08-renewal/0, linked from DR08.01 explorer and core home. Eight checkpoints, before/after row table, DR06 renewal comparison and shared eligibility simulator.
- Read DR08.01 master and draft combined form first. Type of certificate absent; parent Product Number. No subservice cardinality chosen. Master fee 280000, validity 3years, duration 80 days. Draft conditional docs and copied New Registration heading disclosed.
- Application f89d2061 declares GDHT-TM-R but no Java/SQL use outside constants was found. No dedicated DR08 renewal Application strategy or Profile renewal strategy in inspected trees. Profile a9caf9a exposes registration constant only. DR06 difference: its subservice codes are explicitly pending approval rather than declared.
- Actual isolated Application unsupported lookup throws; hypothetical unsupported approval Profile path catches/logs/returns. Existing B registration/licence/snapshot retain prior dates, values and identity. Successful renewal mutation remains unimplemented/unresolved.
- Current shared ApplicationRenewHandler and BaseRenewHandler inspected and added as exact pinned evidence. Shared check uses any matching renewable licence, not B-specific selection. Simulator covers request filters GDHT-TM-L, GDHT-TM-R and null against existing GDHT-TM-L A/B fixtures, with independent isRenewable return values. Domain hook target and service-code translation remain pending.
- Six source snippets added, 208 total exact Git matches. 33 scripts pass syntax. Chrome tested 16 desktop/390px views with expanded source, 12 eligibility combinations, explorer entry, Next and direct reload. Fixed narrow-screen overflow from long constant in prose. Screenshot /tmp/moh-dr08-renewal.png inspected.
- Source-derived local fixtures only; no runtime refactor, live renewal request, database mutation or deployment.

## Latest increment — DR09 main registration
- Entry #dr09-main/0, linked from core home and DR09 explorer. Ten checkpoints and nine-node clickable flow map, selected request/Kafka data, row states, evidence and DR06/08/09 comparison.
- Master reread first, exact certificate type Product Number. Application f89d2061 / Profile a9caf9a inspected. Relevant module files match HEAD. Runtime repositories unchanged; refactors remain paused.
- DR09 takes product/manufacturer fields directly, unlike DR08 DR07 enrichment. Per-product origin is required at submit. Draft saves replace non-null product lists, preserve null and clear on empty; null entries skipped.
- Older document split remains: only five keys checked per product. application_form and authorization treated as shared in that split; merged checklist can pool remaining documents. Interactive selector contrasts it with required scope (only establishment_decision shared). No runtime fix applied.
- Approval product map contains full product values but omits Application product ID, position and contract version. Profile maps list and prerequisite into DTOs, resolves profile via inherited identity resolver, creates registration/licence/snapshot per product. productOrigin uses current product and returns null when missing; downstream null outcome unverified.
- No DR06-style source-pair snapshot fields or module saved-source replay guard found. Unlike DR08, publishEvents selects changedRegistrations. Certificate request details aligned by licence ID. Shared files enrich mutable profile.
- Eleven exact snippets added; all 202 pinned excerpts verify against recorded commits. All 32 scripts pass syntax. Real Chrome checked all 20 desktop/390px views with expanded data/source/comparison, explorer entry, 10 checkpoint selector routes, reload, 9 visual-flow links and required attachment-placement toggle at both widths.
- Screenshot /tmp/moh-dr09-registration.png reviewed. Source-derived fictional fixtures; actual service requests, Kafka delivery, payment and deployed database results remain unexecuted.

## Latest increment — DR08 main registration
- Entry #dr08-main/0, linked from core home and DR08 explorer card. Ten checkpoints, clickable request-to-ISSUE flow map, selected request/Kafka data, row ledger and DR06 comparison.
- Master exact Type of certificate Product Number, reread first. Application f89d2061 and Profile a9caf9a inspected in main checkouts; relevant module files match HEAD. Runtime repositories untouched.
- Request uses traditional_medicine prerequisite plus per-product origin, DR07 brand-name licence ID, MAH, shelf life, intended use and own attachments. Shared establishment_decision only.
- Application save replaces non-null product lists, preserves null list, deletes on empty list. Request product DTO has no stable product ID. Approval product map excludes source row IDs and DR06 contract version. Billable quantity follows saved count.
- Submit validates each product, docs, pharmaceutical prerequisite and DR07 licence references. Shared submit/finalize evidence from actual DR08 Application snapshot included. Lesson shows nonwaived payment plus OPEN relation fixture.
- Profile enriches products before BaseRegisterHandler transaction using first brand name per DR07 licence at consumption time. Missing lookup retains incoming fields. Generic profile resolver gap persists.
- Each product gets its own registration/licence/snapshot. Snapshot uses registration_id PK/FK and has no DR06 source-pair columns. Handler has no DR06 module replay guard and publishEvents selects all profile registrations, unlike changedRegistrations in DR06.
- Legacy shared-origin fallback documented as a difference from per-product-only business rule. Shared attachments enrich mutable profile; snapshot copies own product files.
- 18 new source excerpts, 191 total verified exactly against commits. All 31 scripts pass syntax. Chrome checked 20 desktop/390px views with all data/source/comparison panels expanded, explorer entry, 10 selector routes, reload and all 8 flow-map links.
- Screenshot /tmp/moh-dr08-registration.png inspected. Live request/payment/Kafka/schema/registration outcomes remain unexecuted. Source-based examples use fictional IDs.

## Latest increment — DR06 Free Sale Certificate and cancellation lessons
- Routes #dr06-output/fsc/0 and #dr06-output/cancel/0. Linked from DR06.02/.05 explorer cards and core home.
- Read each master first. Certificate type absent for both. DR06.02 master records MEF 120010151, 400000, 2 Years, 20 days. DR06.05 omits fee/validity, records 15 legacy / 20 new days. No subservice cardinality chosen.
- Six checkpoints each cover existing B result, business requirements, Application routing, Profile boundary, before/after outcomes and implementation gaps.
- No dedicated reagent FSC/cancellation strategies or approved codes in pinned source trees. Application constants explicitly defer subservice codes. Existing Free Sale beans use GDHT-FS-L, described as food products FS03/FS04; no reagent FSC alias inferred.
- Generic BaseTerminateHandler sets the profile TERMINATED and every open licence TERMINATED, flushes/syncs and publishes in a transaction. Interactive scope reference illustrates A and B both affected on successful commit, separately from the actual unsupported DR06 path.
- Cancellation reason exercise follows draft form only. Combined-form cancellation exclusivity, required files and own cancellation template are labelled draft. Certificate extraction contains conflicting five-year validity and New/Renew text, both disclosed. FSC input form has no local detailed extraction.
- Existing rows survive isolated unsupported-code handling. Dedicated output association, mutation/version/history, duplicate semantics, numbering and certificate revocation remain unresolved.
- Five source excerpts added. All 173 pinned excerpts compare exactly to Git; 30 scripts pass syntax. Real isolated Chrome tested 24 desktop/390px views with evidence expanded, shared-handler scope, blank/nonblank reason, both explorer entry links, Next and direct reload.
- Screenshot /tmp/moh-fsc-cancellation.png reviewed. Local simulations only; live subservice execution and deployed wiring unverified.

## Latest increment — DR06 holder and manufacturer change lessons
- Routes #dr06-change/holder/0 and #dr06-change/manufacturer/0. Both linked from corresponding explorer entries DR06.03/.04 and core home.
- Read both subservice masters first. Type of certificate absent for each, parent Product Number. No subservice cardinality was chosen. Fee 300000, 20 days, validity matching original certificate recorded as business source values only.
- Inspected pinned reagent Application/Profile trees and constants. Only registration strategies exist; no dedicated amendment code/DTO/strategy/handler found. Shared combined form fields are draft/unconfirmed, including combined renewal/changes and CamDigiKey input.
- Six checkpoints each: existing B fields, interactive proposed fields, Application factory boundary, Profile unsupported-code handling, surviving-row comparison and implementation gaps.
- Name-only, address-only and both options. Proposed values persist in page memory during navigation, are escaped in row comparisons, and are explicitly distinguished from committed runtime writes. Original registration IDs/source pair and historical registration request remain traceable.
- Existing Java/SQL mah_name/mah_address and manufacturer_name/manufacturer_address mappings verified on Application products and Profile snapshots. Snapshot copying belongs to the existing registration path. No successful amendment mutation is asserted.
- Application unsupported strategy throws; Profile consumer catches unsupported strategy exception and returns. Existing B values survive these isolated boundaries. Future updated/versioned snapshot, number/history/certificate semantics are unresolved.
- Added four exact Git excerpts. All 168 excerpts verified. All 29 scripts pass syntax. Real isolated Chrome checked all 24 desktop/390px views with source expanded, six scope combinations, editing and HTML escaping, Next, explorer entry and reload.
- Screenshot /tmp/moh-holder-manufacturer.png inspected. Source-based local lessons only, no live amendment transaction or deployment.

## Latest increment — service explorer and DR06 renewal source audit
- Explorer #services/DR06 covers 23 master-data entries (3 main + 20 subservices), with family filter, English/Khmer/code search, details and learning links. Core home entry added.
- DR06.01 lesson #dr06-renewal/0 has eight checkpoints covering existing B registration identity, business source, unsupported Application routing, shared renewal save/submit helper, Profile routing, generic transactional renewal handler, interactive unsupported-code outcomes and unresolved decisions.
- Critical finding: pinned Application 3bd064ea and Profile c4dacbe contain only DR06 registration strategies. Application ServiceCode explicitly leaves subservice codes unreserved pending approval. No dedicated reagent renewal strategy/hook exists in inspected trees. Main repository source inventory also showed registration only.
- DR06 main exact certificate type Product Number. DR06.01 master omits the type. Combined form fields are explicitly draft/unconfirmed, including combined operations and unresolved copied versus entered fields. No target/cardinality model was chosen or runtime refactor performed.
- Shared ApplicationRenewHandler sets profileId and delegates to core. Shared BaseRenewHandler loads profile, requires any matching renewable licence, calls hooks, flushes/syncs and publishes. These are displayed as shared framework evidence, not a successful DR06 renewal trace.
- Application unsupported factory throws BaseException. Profile factory exception is caught by consumer which logs and returns for unsupported service. Lesson isolates these boundaries and states earlier validation may reject requests first.
- Full successful DR06 renewal walkthrough remains dependent on confirmed contract and dedicated implementation. UI and final handoff explicitly disclose this limit.
- Added five Git-pinned Java excerpts; all 164 excerpts compare exactly to recorded commits. All 28 scripts pass syntax. Real isolated Chrome tested 62 desktop/390px views, search, family filter, card-to-lesson entry, boundary selector and direct reload.
- Screenshot /tmp/moh-service-explorer.png inspected. Local only, no business database changes or deployment.

## Latest increment — Kafka approval retry and duplicate lessons
- Entry #approval-retry/rollback/0, first core home link and linked from approval message inspection.
- Six manually stepped scenarios, 24 checkpoints. Rollback then successful retry then duplicate, unchanged invalid payload then explicit corrected fixture, duplicate after commit, synchronous ISSUE failure after commit followed by approval replay, conditional overlapping delivery conflict, inconsistent A-only starting fixture.
- Each checkpoint shows Java method, Application earlier APPROVED commit, A/B row state, source-application replay-guard result and event outcome. Inputs preserve source pair (700,802) and per-product origin.
- Verified pinned consumer, handler and schema. Generic inbox bypasses receive/mark. DR06 guard checks any snapshot for source application ID. Source application/product pair and application/position are unique. Consumer document-history work may still run after registration skip.
- Replay after successful Profile commit skips registration and ISSUE publish hook. A successful independent FAILED outbox row remains in the post-commit failure fixture. No automatic outbox repair is claimed.
- A-only preexisting state illustrates application-level guard incompleteness. It is explicitly an inconsistent/legacy diagnostic fixture, not the result of the normal atomic rollback scenario.
- Real isolated headless Chrome tested all 48 desktop/390px checkpoint views, scenario selection, home entry, Next and URL reload. Screenshot /tmp/moh-approval-retries.png reviewed.
- Source excerpts remain 159 verified Git snippets. All 27 scripts pass syntax. Actual Kafka retry/backoff/ack/DLT, live database constraints and concurrency execution remain outside the static simulation.

## Latest increment — six approved Product B improvements completed
- Real headless Google Chrome tested all nine existing failure cases and three phases at 1280px and 390px. All 54 views fit the page width. Phase controls were exercised.
- New preferred entry #b-lesson/journey/0, linked first from core home. Nine checkpoints connect draft, submit/payment and approval/Profile read. Java, data and row panels open in place. Each matching full sequence has a return link to the same checkpoint.
- #b-lesson/compare/0 gives a shared existing-draft fixture with A, B and C, pending edits, successful commit and late resolver rollback side by side.
- #b-lesson/payment/0 asks the learner to predict committed state at AWAITING_PAYMENT, then reveals the later payment message and Application transaction. Includes the remote invoice uncertainty on timeout.
- #b-lesson/message/0 inspects B source ID, origin, files, generated registration ID and actual resolved profile, with snapshot/registration/licence associations and the selected-profile rule gap.
- #b-lesson/practice/0 has three debugging exercises with choices, feedback and hidden explanations/source. Covers save rollback, per-product submit validation and Profile contract rejection after Application approval.
- Chrome tested all 21 new views at desktop and 390px with panels expanded, prediction feedback and debugging controls. Verified core home entry, nine sequence round trips, five message selector routes and reload of a direct exercise route.
- Screenshot /tmp/moh-product-b-lessons.png inspected. Comparison columns balanced after visual review.
- 26 scripts pass syntax. Existing 159 pinned source excerpts still match Git. New lessons reuse those excerpts and existing models.
- The lessons simulate source-derived outcomes with fictional IDs and specified injected/conditional failures. No live MOH business transaction was exercised. All changes stay in the local learning site.

## Latest increment — failure branches inside the three sequences
- Local only. Entry links #flow-failure/save/resolution/0, #flow-failure/submit/documents/0 and #flow-failure/approve/product/0.
- Every successful sequence has a Sequence scenario selector. Nine cases offer three phases each, before the attempt, at the failure and after handling.
- Save cases cover attachment placement, foreign product ID after parent/detail saves, late attachment resolution after pending C deletion/A update, and controller response mapping after service commit.
- Submit cases cover Product B’s missing required form and invoice reply timeout. Prior committed incomplete draft data remains. A timeout does not prove whether a remote invoice exists.
- Approval cases cover contract rejection before handler entry, injected B processing failure after A saves, and a synchronous ISSUE send exception after Profile commit with successful REQUIRES_NEW FAILED outbox recording.
- Approval diagrams begin at REVIEW. At their Profile failure point, Application APPROVED is already committed and survives. Profile transaction rollback and post-commit survival are shown separately.
- Red arrows identify the failure; amber dashed arrows identify rollback. Tables distinguish initial, pending/reached, and final saved row states. Compare links return to the matching successful checkpoint.
- All examples are source-based boundary simulations with stated assumptions. No real MOH request, Kafka delivery or database mutation was executed.
- Added exact invoice timeout/wrapper source evidence. 159 pinned excerpts match their Git revisions. All 25 scripts pass syntax; all 26 asset hashes and HTTP responses pass.
- A lightweight DOM stub executed scripts in index order, rendered all 56 success/failure views and exercised scenario/phase callbacks. All 27 failure pages have balanced HTML tags. Model checks verified stopping points, lanes and evidence references.
- Browser QA was attempted, but Browser runtime returned “Local browser access is unavailable for this chat,” including its troubleshooting lookup. No new screenshot or mobile-layout verification was possible this increment. Previous screenshot claims below refer to earlier increments only.
- Local review server restarted on 127.0.0.1:8764 and retained for user review. No deployment or commits.

# Local learning-site checkpoint

The user approved autonomous local improvement cycles. Deployment, runtime refactors, database mutations, commits and pushes need a separate instruction. Never inspect credential directories or .env files.

## Latest increment — interactive core sequence diagrams
- Added flow-sequence.js, integrated directly into all existing #flow/save, #flow/submit and #flow/approve checkpoints.
- Save: 12 clickable exchanges grouped into 9 checkpoints. Submit: 15 exchanges / 9 checkpoints. Approval: 16 exchanges / 11 checkpoints.
- Native clickable exchange buttons, participant lifelines, self calls, database work, returns and differentiated Kafka handoffs.
- Current method, selected boundary data and a cumulative row ledger remain aligned with the checkpoint.
- Rows reveal creation, pending changes and commit transitions. B’s origin and own files remain attached to its ID.
- Approval diagram explicitly chooses one possible resolver outcome: actual profile 99 versus selected prerequisite 42. It illustrates the known rule gap; it is not the deployed state.
- Save diagram uses the successful new-draft fixture. Submit uses non-waived payment and an OPEN relation gate. Multiple exchanges can share a checkpoint, and the ledger shows state after that checkpoint.
- Sideways and vertical diagram scrolling stay inside the diagram container. Current checkpoint auto-scrolls into context.
- Stepping within the same flow preserves page scroll position. Changing flows resets to the top.
- Browser tested all 29 checkpoint views and all 43 exchange buttons, previous/next navigation, last-step comparison link and direct routes.
- At 390px, all three pages fit the viewport; participant canvases scroll horizontally. Fixed a submit panel intrinsic-width overflow and button text contrast.
- Static checks: 24 scripts pass syntax, 157 Git-pinned excerpts match, asset hashes match, all sequence checkpoints have participants and data.
- Screenshot /tmp/moh-core-sequences.jpg. Review URL #flow/approve/7.
- No live MOH request, database mutation, Kafka delivery or deployment was executed.

## Latest increment — the three primary flows
- Promoted #core-flows to the first core home entry.
- Save draft: #flow/save/0, nine detailed checkpoints.
- Submit: #flow/submit/0, nine detailed checkpoints.
- Approve: #flow/approve/0, eleven checkpoints across Application and Profile.
- Each checkpoint includes active service, Java method chain, behaviour, row effects, transaction boundary, failure point and original source.
- Selected draft request fields, submit request/waiting response, and decoded approval form data are available in expandable panels.
- Outcome comparisons distinguish transaction failure, post-service response failure, submit wrapper status versus actual application state, and Application approval versus Profile completion.
- Submit matrix includes unpaid invoice, paid/open, re-submission, WAITING_RELATION and related-rejected RETURNED outcomes. metadata.status can remain SUBMITTED for the latter branches.
- Save event explanation follows write order: core CREATE publish is inside common save, service CREATE publish follows strategy completion, transactional listeners run after commit. Both publish sites are present on new-draft source path.
- Approval uses P for actual resolved profile, keeping prerequisite 42 and the resolver gap distinct.
- Profile handler synchronization and non-fatal post-strategy document-history recording are covered, with source.
- Browser checked all 29 checkpoints, expanded submit payload/outcome panels, and 390px layouts for all three flows.
- Checks pass for 23 scripts and 157 Git-pinned excerpts; flow reference keys and asset hashes resolve.
- Current preferred review URL http://127.0.0.1:8764/#core-flows.
- Screenshot /tmp/moh-three-core-flows.jpg.
- Source-based walkthrough only. No live MOH submit, approval, database mutation or deployment performed.

## Latest increment — caught exceptions and independent transactions
- Entry #partial-save, linked as the first core lesson and from the original rollback lab.
- Six cases, three phases each. All 18 phase combinations and URL reload were browser tested.
- Cases cover a caught same-transaction helper error, a caught joined REQUIRED participant failure, independent inner commit followed by outer rollback, independent inner rollback caught by outer, controller response failure after service commit, and Profile post-commit listener failure with successful FAILED outbox recording.
- Teaching examples are labelled separately from source-backed call order with injected failures. Conditions matter: a caught exception can still leave the transaction rollback-only.
- Source-backed Application payment case assumes a direct helper BaseException caught before any other interceptor marks rollback-only. This is an event handler, not necessarily a failed HTTP request.
- Profile licence operation publishing is active in publishWithOutbox. OutboxServiceImpl.record uses REQUIRES_NEW and catches save exceptions. The UI assumes the outbox write succeeds for the after-commit failure case. Its generic inbox remains bypassed, a separate fact.
- Kafka send case models a synchronous thrown error, not asynchronous future completion.
- Ran temporary /tmp/Dr06PropagationCheck.java with Spring 6.2.15 and an in-memory diagnostic transaction resource, not a database. Assertions passed for all five propagation/callback outcomes.
- Recorded output and dependency fingerprints in propagation-observation.js.
- Current full checks pass for 22 scripts, 135 pinned source excerpts, asset hashes and propagation diagnostic artifact hashes.
- Core home now has fifteen entries.
- Review screenshot /tmp/moh-partial-save.jpg. Preferred example #partial-save/responseFailure/2.

## Latest increment — rollback and partial failures
- Entry point http://127.0.0.1:8764/#rollback-lab (default late attachment-resolution case).
- Direct outcome http://127.0.0.1:8764/#rollback-lab/resolution/2.
- Five cases, three phases each: early scope validation, invalid product ID after parent/detail saves, late attachment resolver failure after pending product changes, Profile parse rejection, injected runtime failure inside Profile registration.
- Browser tested all 15 combinations, direct outcome links, reload and 390px layout.
- Late resolution is an explicitly conditional scenario after earlier checks passed. Already-unknown public files fail ownership earlier.
- Key verified exception fact: CustomValidationException extends BadRequestException, which extends BaseException, which extends RuntimeException. NotFoundException also extends BaseException.
- Inspected common_library 1.0.4 installed classes using javap. Parent Boot 3.5.10 identifies Spring 6.2.15.
- Executed a temporary Java default-rule check using actual installed Spring 6.2.15, common_library 1.0.4 and the compiled Application validation exception. CustomValidationException, NotFoundException and IllegalArgumentException all produce rollback=true. A plain checked Exception produces false.
- Diagnostic output and dependency/class hashes are in rollback-observation.js. This is a framework policy check, not a real service/database integration test.
- Row outcomes are source-based predictions for normal proxy-managed transaction calls with uncaught runtime exceptions. Save/flush can occur before rollback. Already committed transactions in another service remain.
- Supporting exception source snippets use MOH-Common-Library commit 48d814c. Reading this dependency served the Application/Profile trace; no runtime changes were made.
- Screenshot /tmp/moh-rollback-lab.jpg.
- Current checks: 20 scripts, 129 Git-pinned excerpts, asset hashes and diagnostic artifact fingerprints pass.
- Core home has fourteen entries. Next rollback work can investigate caught exceptions, new transaction propagation, or external side effects separately.

## Latest focus — Application and Profile only
The user narrowed ongoing work to these two repositories. New entry point is http://127.0.0.1:8764/#core. The brand link and empty-hash route open the core home.

### Correction to earlier walkthrough assumptions
The DR06 Profile handler does not override resolveProfile. RegisterHandlerHooks.resolveProfile calls BaseRegisterHandler.getOrCreateNewProfile. That resolver uses company/licensee identity, can reuse a different candidate or create a profile, and does not select by prerequisite_profile_id. The mandatory Product Number rule requires the selected existing profile. Earlier profile-42 wording overstated implementation verification. A global notice, dedicated rule/code lesson and resolver simulator now disclose this gap. Older walkthroughs use 42 as the intended fictional outcome. Runtime code was not edited.

### New verified core lessons
Before the rollback increment, core home contained thirteen entries. Its checks passed for 18 scripts, 126 pinned source excerpts, versioned assets and the separately fingerprinted local generated mapper.
- Draft edit laboratory: seven cases for omitted/empty lists, reorder, remove, foreign ID, duplicate ID and new product.
- Null-field mapper lab: three cases, with local generated setter excerpt. The build artifact is recorded separately in mapper-observation.js with its path and SHA-256, not presented as Git-versioned source. No Maven build was run in this session.
- File-resolution lab: five cases tested, following list omission, null/empty product files, stored file metadata and unknown public-user file IDs.
- Validation boundaries: five draft-versus-submit cases, with file ownership and attachment placement.
- Profile resolver: five identity-candidate branches with required selection and actual result side by side.
- Approval contract gate: five input conditions.
- Snapshot boundary: three comparisons. The renamed-draft example is explicitly hypothetical and does not imply approved-draft edit permission.
- Java/SQL identity map: four expressions, including detail.getId mapped to registration_id via @MapsId.
- Product read trace: registration ID endpoint, fetch joins, owner check and response mapping.
- Owner visibility lab: matching public user, different public user and null method argument for non-public context. This is not a full security audit.
- Core source search: Application/Profile excerpts only.
- All new selectors exercised in the browser. Core home and six representative labs checked at 390px with no page overflow.
- Existing Java navigation lesson linked from the core home.

### Next core-only priorities
1. Inspect remaining old claims about actual profile selection and tighten any ambiguous wording.
2. Extend rollback investigation to caught exceptions and separate transactions, keeping source predictions distinct from integration observations.
3. Deepen Application approval snapshot envelope and Profile parse contract inspection.
4. Trace Profile registration/operation synchronisation and subsequent read consistency.
5. Continue keyboard and focused source navigation checks.

## Project rule checked first
DR06 master data was reread before service analysis. Exact Type of certificate is Product Number. Multiple products share one application and selected existing profile. Each product owns its origin, files, registration and licence. Root establishment_decision is the sole shared attachment.

## Completed and verified in this session
- Review timeline: tested all ten frames through decoded approval data at Profile listener entry.
- Field lineage: origin, product ID and attachments, six boundaries each.
- Failure lab: five scenarios with prediction feedback and source investigation hints.
- Transaction lesson: six service boundaries, including commit-time sends and asynchronous certificate processing.
- Learning path: fifteen ordered entries and a browser-local self-assessment checklist. Persistence tested, test check removed afterward.
- Code practice: three symptoms with choices, editor navigation hints and explanation checks.
- Connected workbench: twelve stages synchronize service lanes, ER rows, Java method and source. Step stored in URL.
- Source reader: original line numbers; searchable index of 107 excerpts with repository, revision and local file path.
- Message-order simulator: payment-first and submission-first paths in Review. Both tested through IN_REVIEW / PAID at the Bureau, with different history action types.
- ER inspector: all eight tables now explain relationship count, keys and ownership.
- Java call path: seven steps explain shared controller, JSON subtype and strategy selection, product write and response read.
- Certificate continuation: five stages trace success/failure through CertificateIssuedMessage, Profile READY/FAILED updates and portal download lookup. Both outcomes tested.
- Verified a Profile regeneration service path with eligibility filters and new operation IDs. Runtime permission and execution remain unverified.
- Compact lesson menu and narrow-screen layout corrections.

## Verification
- All 107 excerpts compared byte-for-byte (line content) with recorded Git revisions.
- All 16 loaded JavaScript files passed node --check.
- Asset content hashes checked against index.html.
- New lesson evidence references resolve.
- Browser checks covered new lesson interactions, replay and failure feedback, saved checklist, source search, direct source links, workbench progression and stage counts.
- At 390 px, checked learning path, workbench, field lineage, failure lab, transactions and final review checkpoint. Corrected button/heading overflow.
- Screenshot saved to /tmp/moh-learning-path.jpg for review.
- No live MOH service, database write, payment or PDF issuance was executed.

## Source snapshots
Application 3bd064ea and Profile c4dacbe on the DR06 refactor worktrees.
Review 5effb54, Payment 9211972, Certificate f84605e.
Portal 71509533 and Gateway 32a85fb from the earlier trace.
The site uses fictional IDs and selected fields. Source snapshots do not establish current deployed configuration.

## Findings to retain
- ProfileKafkaConsumer.handleWithInbox currently bypasses the generic inbox. DR06 has its own saved-source replay guard and unique source-pair constraint.
- Certificate inserts processed_operation before async work. The inspected error path does not remove that marker. Replaying the same ID can be skipped after a PDF failure.
- Review seed has five named steps including Payment. Master data has six workflow codes; SW_C and DR_V mapping remains unresolved.
- The message-order simulator assumes an existing Review draft, successful handlers and seeded PAY_FIRST configuration.
- Template availability, reviewer assignment, Kafka retry/delivery configuration and actual DR06 certificate rendering remain unverified in a running environment.
- Workbench combines submit/payment and review into conceptual stages. Detailed timelines expand those stages.
- Source excerpt previews are partial. Use the recorded file and revision to inspect surrounding code.

Core review screenshot is saved to /tmp/moh-core-learning.jpg.

## Current preview
http://127.0.0.1:8764/#core
Static server serves this folder. index.html also works offline.
Use Explore lessons to reach all views.

## Earlier broader priorities — superseded by the core-only priorities above
1. Add an after-upload-failure document comparison, including the initial certificate row, actual result status and supported recovery entry point.
2. Trace the portal UI caller of the generic download repository and its loading/error states.
3. Expand request/response envelope inspection with exact Avro mappings and selected HTTP response fields.
4. Check keyboard focus and horizontal diagram navigation more thoroughly.
5. Improve source excerpt method-name search coverage where snippets start inside method bodies.

## Maintenance
index.html uses content hashes in asset URLs to avoid mixed cached versions during local editing. Refresh affected hashes whenever those files change.
Keep changes confined to this learning project. Documentation stays local and out of MOH commits.
