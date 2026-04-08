# Tickgow

Date comparison and human-readable time formatting.

## Overview

Tickgow lets you compare two dates, giving you detailed calculated outputs on exactly how much time has passed.

- Get both normalized and raw time differences between two dates.
- Easily convert dates into relative strings like "5 months ago", "in 2 days", or "just now".
- Work Node.js and the browser.

## Installation & Usage

### Installation

#### Browser

Include the script tag:

```html
<script src="https://cdn.jsdelivr.net/gh/rezzvy/tickgow@94831b1/dist/tickgow.min.js"></script>
```

#### Node

Install via npm:

```bash
npm install tickgow
```

```javascript
const Tickgow = require("tickgow");
```

### Usage

```javascript
Tickgow.compare("2020-01-01", "2026-01-01");
Tickgow.now(Date.now());
```

## Examples

### Human-Readable Time

```javascript
// Assuming today is April 2026
const past = Tickgow.now("2026-04-01");
// "1 week ago"

const future = Tickgow.now("2028-01-01");
// "in 1 year"

const rightNow = Tickgow.now(Date.now());
// "just now"
```

### Date Comparison

```javascript
const comparison = Tickgow.compare("2020-01-01", "2026-01-01");
console.log(comparison.years); // 6
console.log(comparison.isFuture); // false
console.log(comparison.raw.days); // 2192
```

### Custom Labels

> [!NOTE]  
> Baru saja is Indonesian meaning "just now"

```javascript
Tickgow.defaultLabels.now = "Baru saja";

const rightNow = Tickgow.now(Date.now());
// "Baru saja"
```

## Documentation

### API Reference

#### `Tickgow.now(date)`

Calculates the difference between the provided `date` and the current time (`Date.now()`), returning a human-readable string based on the largest unit of time passed.

| Parameter  | Type                           | Description                                           |
| :--------- | :----------------------------- | :---------------------------------------------------- |
| `date`     | `String` \| `Number` \| `Date` | The target date to compare against the current time.  |

**Returns:** `String` (e.g., `"2 years ago"`, `"in 5 minutes"`, `"just now"`)

#### `Tickgow.compare(date1, date2)`

Compares two dates and returns a detailed object containing both normalized calendar units and raw total units.

| Parameter | Type                           | Description                      |
| :-------- | :----------------------------- | :------------------------------- |
| `date1`   | `String` \| `Number` \| `Date` | The first date for comparison.   |
| `date2`   | `String` \| `Number` \| `Date` | The second date for comparison.  |

**Returns:** `Object`

| Property       | Type       | Description                                               |
| :------------- | :--------- | :-------------------------------------------------------- |
| `isFuture`     | `Boolean`  | `true` if `date1` is further in the future than `date2`.  |
| `years`        | `Number`   | Normalized years difference.                              |
| `months`       | `Number`   | Normalized months difference.                             |
| `days`         | `Number`   | Normalized days difference.                               |
| `hours`        | `Number`   | Normalized hours difference.                              |
| `minutes`      | `Number`   | Normalized minutes difference.                            |
| `seconds`      | `Number`   | Normalized seconds difference.                            |
| `raw`          | `Object`   | Contains the raw total differences between the dates.     |
| `raw.ms`       | `Number`   | Total difference in milliseconds.                         |
| `raw.seconds`  | `Number`   | Total difference in seconds.                              |
| `raw.minutes`  | `Number`   | Total difference in minutes.                              |
| `raw.hours`    | `Number`   | Total difference in hours.                                |
| `raw.days`     | `Number`   | Total difference in days.                                 |
| `raw.months`   | `Number`   | Total difference in decimal months.                       |
| `raw.years`    | `Number`   | Total difference in decimal years.                        |

#### `Tickgow.defaultLabels`

A static object containing the default vocabulary used by the `now()` method to format relative time strings. You can modify this object to customize the output or localize the strings into different languages.

**Default Value:**

```javascript
Tickgow.defaultLabels = {
  year: { singular: "year", plural: "years", past: "ago", future: "in" },
  month: { singular: "month", plural: "months", past: "ago", future: "in" },
  day: { singular: "day", plural: "days", past: "ago", future: "in" },
  hour: { singular: "hour", plural: "hours", past: "ago", future: "in" },
  min: { singular: "minute", plural: "minutes", past: "ago", future: "in" },
  sec: { singular: "second", plural: "seconds", past: "ago", future: "in" },
  now: "just now",
};
```

## Contributing

There's always room for improvement. Feel free to contribute!

## Licensing

The project is licensed under the MIT License. Check the license file for more details.
