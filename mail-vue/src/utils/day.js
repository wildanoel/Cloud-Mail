import dayjs from 'dayjs'
import 'dayjs/locale/en'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {useSettingStore} from "@/store/setting.js";
const settingStore = useSettingStore();
dayjs.extend(utc)
dayjs.extend(timezone)
// Always use English dayjs locale - Chinese locale intentionally not imported
dayjs.locale('en')
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function fromNow(date) {
    const d = dayjs.utc(date).tz(timeZone);
    const now = dayjs();
    const diffSeconds = now.diff(d, 'second');
    const diffMinutes = now.diff(d, 'minute');
    const diffHours = now.diff(d, 'hour');
    const diffDays = now.diff(d, 'day');
    const isToday = now.isSame(d, 'day');
    if (isToday) {
        if (diffSeconds < 60) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        if (diffHours < 2) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return d.format('hh:mm A');
    }
    if (now.subtract(1, 'day').isSame(d, 'day')) {
        return d.format('MMM D');
    }
    if (diffDays < 7) return d.format('ddd');
    return d.year() === now.year()
        ? d.format('MMM D')
        : d.format('YYYY/MM/DD');
}

export function updateNow(date) {
    if (isToday) {
        if (diffSeconds < 60) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        if (diffHours < 2) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return d.format('hh:mm A');
    }
}

export function formatDetailDate(time) {
    const d = dayjs.utc(time).tz(timeZone);
    const now = dayjs();
    const isSameYear = now.year() === d.year();
    return isSameYear
        ? d.format('ddd, MMM D, h:mm A')
        : d.format('ddd, MMM D, YYYY, h:mm A');
}

export function tzDayjs(time) {
    return dayjs.utc(time).tz(timeZone)
}

export function toUtc(time) {
    return dayjs(time).utc()
}

export function setExtend(lang) {
    dayjs.locale(lang || 'en')
}