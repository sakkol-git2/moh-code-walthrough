# My simple review checklist

**Use only this checklist.** Keep the website and Java editor side by side.

## Start

- [x] Open the website. Click **Service explorer** in the top bar or **Explore lessons → Service explorer**.
- [x] Open `/Users/apple/Documents/TSC-MOH` in your editor. Match the Java revision shown in each lesson.

If you need to start the website:

```sh
cd /Users/apple/Documents/moh-code-walkthrough
python3 -m http.server 8765 --bind 127.0.0.1
```

Open [the service explorer](http://127.0.0.1:8765/#services/DR06).

## Repeat these four actions

**Predict → click → find the Java → explain the row change.**

Ask yourself: Who acts? Which method runs? What data moves? What stays saved?

## Review in this order

The work below totals **15 hours**. Add **15-minute breaks after each 75 minutes** for an 18-hour day.

| Done | Time | What I do |
|---|---|---|
| [ ] | 1h | **Explore.** Switch DR06/DR08/DR09. Open the lifecycle map. Click registration, renewal, changes, FSC and cancellation. |
| [ ] | 3h | **DR06 core flows.** Follow save draft → submit → payment → approval. At each step, find the named Java method and explain when rows commit. |
| [ ] | 2h | **Trace Product B.** Enter guided mode. Click ER tables and inspector fields. Follow origin, attachments and IDs through request → Java → Kafka → Profile. Compare before, pending and saved values. |
| [ ] | 2h | **Try failures.** Remove B’s required data, inspect Profile rollback, then try duplicate approval. Predict which rows survive before revealing the outcome. |
| [ ] | 2h | **Compare DR08 and DR09.** Follow their main lessons. Check product-list replacement, DR07 field sourcing, attachment rules and omitted source IDs against Java. |
| [ ] | 2h | **Review subservices.** Open every renewal, change, FSC and cancellation card. Check proposed versus saved rows. Verify declared code versus actual strategy. Record missing implementations. |
| [ ] | 2h | **Test.** Read and run relevant existing backend tests. In the website, try Next/Back, reload, table/field selection and mobile width. Record actual results. |
| [ ] | 1h | **Explain and finish.** Explain Product B’s journey without reading. Write your five biggest findings and three next questions. |

## Write one line when something is unclear

```text
Page/step | Java method | What I expected | What I found | Question
```

Check an item when you can explain it. Put unfinished work in your notes.

**Remember:** website values are fictional examples. A missing strategy is an implementation gap. Use source, test reports or real local observations to verify behaviour.
