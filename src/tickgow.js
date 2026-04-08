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

    static #calculateRawCalendarUnits(earlier, later) {
        let totalMonths = 0;
        let current = new Date(earlier);

        while (true) {
            const next = new Date(current);
            next.setUTCMonth(next.getUTCMonth() + 1);

            if (next <= later) {
                totalMonths++;
                current = next;
            } else {
                break;
            }
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
        let years = 0, months = 0, days = 0;
        let current = new Date(earlier);

        while (true) {
            const nextYear = new Date(current);
            nextYear.setUTCFullYear(nextYear.getUTCFullYear() + 1);

            if (nextYear <= later) {
                years++;
                current = nextYear;
            } else break;
        }

        while (true) {
            const nextMonth = new Date(current);
            nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);

            if (nextMonth <= later) {
                months++;
                current = nextMonth;
            } else break;
        }

        const daysInMonth = this.#getDaysInMonth(current.getUTCFullYear(), current.getUTCMonth());
        while (true) {
            const nextDay = new Date(current);
            nextDay.setUTCDate(nextDay.getUTCDate() + 1);

            if (nextDay <= later && days < daysInMonth - 1) {
                days++;
                current = nextDay;
            } else break;
        }

        const remainingMs = later - current;

        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

        return { years, months, days, hours, minutes, seconds };
    }

    static #getDaysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
}

module.exports = Tickgow;