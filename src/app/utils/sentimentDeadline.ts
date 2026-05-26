import type { SentimentLevel } from '../types';

const urgentLevels: SentimentLevel[] = ['较大', '重大', '特别重大'];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function toDateTimeLocalValue(value: string | undefined) {
  if (!value) {
    return '';
  }

  const normalized = value.replace(' ', 'T');

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    return normalized;
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDateTimeLocal(value: string | undefined) {
  return toDateTimeLocalValue(value).replace('T', ' ');
}

export function getPresetDeadline(level: SentimentLevel, baseDate = new Date()) {
  const hours = urgentLevels.includes(level) ? 24 : 48;
  const date = new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
  return toDateTimeLocalValue(date.toISOString());
}

export function getDeadlineRuleText(level: SentimentLevel) {
  return urgentLevels.includes(level)
    ? '较大/重大/特别重大舆情默认 24 小时内处理完成'
    : '轻微及一般舆情默认 48 小时内处理完成';
}
