class Tickgow {
    static defaultLabels = {
        year: { singular: 'year', plural: 'years', past: 'ago', future: 'in' },
        month: { singular: 'month', plural: 'months', past: 'ago', future: 'in' },
        day: { singular: 'day', plural: 'days', past: 'ago', future: 'in' },
        hour: { singular: 'hour', plural: 'hours', past: 'ago', future: 'in' },
        min: { singular: 'minute', plural: 'minutes', past: 'ago', future: 'in' },
        sec: { singular: 'second', plural: 'seconds', past: 'ago', future: 'in' },
        now: 'just now'
    };

    static now(date) {
        const result = Tickgow.compare(date, Date.now());

        let value = 0;
        let unitKey = '';

        if (result.years > 0) {
            value = result.years;
            unitKey = 'year';
        } else if (result.months > 0) {
            value = result.months;
            unitKey = 'month';
        } else if (result.days > 0) {
            value = result.days;
            unitKey = 'day';
        } else if (result.hours > 0) {
            value = result.hours;
            unitKey = 'hour';
        } else if (result.minutes > 0) {
            value = result.minutes;
            unitKey = 'min';
        } else if (result.seconds > 0) {
            value = result.seconds;
            unitKey = 'sec';
        } else {
            return Tickgow.defaultLabels.now || "";
        }

        const config = Tickgow.defaultLabels[unitKey] || {};
        const unitName = value === 1 ? (config.singular || "") : (config.plural || "");
        const directionWord = result.isFuture ? (config.future || "") : (config.past || "");

        let output = "";

        if (result.isFuture) {
            output = `${directionWord} ${value} ${unitName}`;
        } else {
            output = `${value} ${unitName} ${directionWord}`;
        }

        return output.replace(/\s+/g, ' ').trim();
    }

    static compare(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            throw new Error('Invalid date provided');
        }

        const isFuture = d1 > d2;

        const earlier = isFuture ? d2 : d1;
        const later = isFuture ? d1 : d2;

        const rawMs = later - earlier;
        const rawSeconds = rawMs / 1000;
        const rawMinutes = rawSeconds / 60;
        const rawHours = rawMinutes / 60;
        const rawDays = rawHours / 24;

        const rawCalendarUnits = this.#calculateRawCalendarUnits(earlier, later);
        const normalized = this.#calculateNormalized(earlier, later);

        return {
            isFuture,
            years: normalized.years,
            months: normalized.months,
            days: normalized.days,
            hours: normalized.hours,
            minutes: normalized.minutes,
            seconds: normalized.seconds,
            raw: {
                ms: rawMs,
                seconds: rawSeconds,
                minutes: rawMinutes,
                hours: rawHours,
                days: rawDays,
                months: rawCalendarUnits.months,
                years: rawCalendarUnits.years
            }
        };
    }

    static #safeAddMonths(date, monthsToAdd) {
        const d = new Date(date);
        const targetMonth = d.getUTCMonth() + monthsToAdd;
        const targetYear = d.getUTCFullYear() + Math.floor(targetMonth / 12);

        const normalizedMonth = ((targetMonth % 12) + 12) % 12;
        const daysInTargetMonth = this.#getDaysInMonth(targetYear, normalizedMonth);

        d.setUTCFullYear(targetYear);
        d.setUTCDate(Math.min(d.getUTCDate(), daysInTargetMonth));
        d.setUTCMonth(normalizedMonth);

        return d;
    }

    static #calculateRawCalendarUnits(earlier, later) {
        let totalMonths = (later.getUTCFullYear() - earlier.getUTCFullYear()) * 12 + (later.getUTCMonth() - earlier.getUTCMonth());
        let current = this.#safeAddMonths(earlier, totalMonths);

        if (current > later) {
            totalMonths--;
            current = this.#safeAddMonths(earlier, totalMonths);
        }

        const remainingMs = later - current;
        const daysInMonth = this.#getDaysInMonth(current.getUTCFullYear(), current.getUTCMonth());
        const msInAMonth = daysInMonth * 24 * 60 * 60 * 1000;

        const fractionalMonth = remainingMs / msInAMonth;
        const rawMonths = totalMonths + fractionalMonth;
        const rawYears = rawMonths / 12;

        return { months: rawMonths, years: rawYears };
    }

    static #calculateNormalized(earlier, later) {
        let years = later.getUTCFullYear() - earlier.getUTCFullYear();
        let current = this.#safeAddMonths(earlier, years * 12);

        if (current > later) {
            years--;
            current = this.#safeAddMonths(earlier, years * 12);
        }

        let months = (later.getUTCFullYear() - current.getUTCFullYear()) * 12 + (later.getUTCMonth() - current.getUTCMonth());
        let tempMonth = this.#safeAddMonths(current, months);

        if (tempMonth > later) {
            months--;
            current = this.#safeAddMonths(current, months);
        } else {
            current = tempMonth;
        }

        const remainingMs = later - current;

        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const msWithoutDays = remainingMs % (1000 * 60 * 60 * 24);
        const hours = Math.floor(msWithoutDays / (1000 * 60 * 60));
        const minutes = Math.floor((msWithoutDays % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((msWithoutDays % (1000 * 60)) / 1000);

        return { years, months, days, hours, minutes, seconds };
    }

    static #getDaysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
}

module.exports = Tickgow;