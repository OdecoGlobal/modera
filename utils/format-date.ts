export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  };
  const dateShortOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  return {
    dateTime: new Date(dateString).toLocaleString('en-US', dateTimeOptions),
    dateOnly: new Date(dateString).toLocaleString('en-US', dateOptions),
    dateShort: new Date(dateString).toLocaleString('en-US', dateShortOptions),
    timeOnly: new Date(dateString).toLocaleString('en-US', timeOptions),
  };
};
