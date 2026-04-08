const test = require("node:test");
const assert = require("node:assert");
const Tickgow = require("../dist/tickgow.node");

test("compare() should correctly calculate past differences", () => {
    const now = Date.now();
    const past = new Date(now - (2 * 60 * 60 * 1000)); 

    const result = Tickgow.compare(past, now);
    assert.strictEqual(result.isFuture, false);
    assert.strictEqual(result.hours, 2);
    assert.strictEqual(result.minutes, 0);
});

test("compare() should correctly calculate future differences", () => {
    const now = Date.now();
    const future = new Date(now + (5 * 24 * 60 * 60 * 1000)); 

    const result = Tickgow.compare(future, now);
    assert.strictEqual(result.isFuture, true);
    assert.strictEqual(result.days, 5);
});

test("compare() should throw an error for invalid dates", () => {
    assert.throws(() => {
        Tickgow.compare("invalid-date", Date.now());
    }, /Invalid date provided/);
});

test("now() should format past dates correctly using defaults", () => {
    const pastSecs = new Date(Date.now() - (10 * 1000)); 
    const pastMins = new Date(Date.now() - (5 * 60 * 1000)); 

    assert.strictEqual(Tickgow.now(pastSecs), "10 seconds ago");
    assert.strictEqual(Tickgow.now(pastMins), "5 minutes ago");
});

test("now() should format future dates correctly using defaults", () => {
    const futureHours = new Date(Date.now() + (3 * 60 * 60 * 1000)); 

    assert.strictEqual(Tickgow.now(futureHours), "in 3 hours");
});

test("now() should return the 'now' label for differences under 1 second", () => {
    const rightNow = new Date();
    assert.strictEqual(Tickgow.now(rightNow), "just now");
});

test("now() should format properly when singular form is needed", () => {
    const oneMinuteAgo = new Date(Date.now() - (60 * 1000));
    assert.strictEqual(Tickgow.now(oneMinuteAgo), "1 minute ago");
});

test("now() should reflect user mutations to defaultLabels globally", () => {
    const originalLabels = JSON.parse(JSON.stringify(Tickgow.defaultLabels));
    Tickgow.defaultLabels.sec = { singular: "s", plural: "s", past: "-", future: "+" };

    const pastSecs = new Date(Date.now() - (30 * 1000));
    const futureSecs = new Date(Date.now() + (15 * 1000));

    assert.strictEqual(Tickgow.now(pastSecs), "30 s -");
    assert.strictEqual(Tickgow.now(futureSecs), "+ 15 s");

    Tickgow.defaultLabels = originalLabels;
});

test("now() should fallback cleanly if user provides sketchy or empty labels", () => {
    const originalLabels = JSON.parse(JSON.stringify(Tickgow.defaultLabels));
    Tickgow.defaultLabels.min = {};

    const pastMins = new Date(Date.now() - (5 * 60 * 1000));
    assert.strictEqual(Tickgow.now(pastMins), "5");

    Tickgow.defaultLabels = originalLabels;
});

test("compare() should handle leap years correctly", () => {
    const leapYearStart = new Date("2024-02-28T00:00:00Z");
    const leapYearEnd = new Date("2024-03-01T00:00:00Z");
    const leapResult = Tickgow.compare(leapYearStart, leapYearEnd);
    assert.strictEqual(leapResult.days, 2);
    assert.strictEqual(leapResult.months, 0);

    const normalYearStart = new Date("2023-02-28T00:00:00Z");
    const normalYearEnd = new Date("2023-03-01T00:00:00Z");
    const normalResult = Tickgow.compare(normalYearStart, normalYearEnd);
    assert.strictEqual(normalResult.days, 1);
    assert.strictEqual(normalResult.months, 0);
});

test("compare() should handle exact month boundaries and different month lengths", () => {
    const janEnd = new Date("2023-01-31T00:00:00Z");
    const febStart = new Date("2023-02-01T00:00:00Z");
    const daysResult = Tickgow.compare(janEnd, febStart);
    assert.strictEqual(daysResult.months, 0);
    assert.strictEqual(daysResult.days, 1);

    const janStart = new Date("2023-01-01T00:00:00Z");
    const exactMonthResult = Tickgow.compare(janStart, febStart);
    assert.strictEqual(exactMonthResult.months, 1);
    assert.strictEqual(exactMonthResult.days, 0);
});

test("compare() should handle year crossovers correctly", () => {
    const newYearEve = new Date("2022-12-31T00:00:00Z");
    const nextNextYear = new Date("2024-01-01T00:00:00Z");

    const crossoverResult = Tickgow.compare(newYearEve, nextNextYear);
    assert.strictEqual(crossoverResult.years, 1);
    assert.strictEqual(crossoverResult.months, 0);
    assert.strictEqual(crossoverResult.days, 1);
});

test("now() should prioritize the largest time unit correctly", () => {
    const now = new Date("2024-01-01T00:00:00Z").getTime();

    const originalDateNow = Date.now;
    Date.now = () => now;

    const pastDate = new Date("2022-12-01T00:00:00Z");

    assert.strictEqual(Tickgow.now(pastDate), "1 year ago");
    Date.now = originalDateNow;
});