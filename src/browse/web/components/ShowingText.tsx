interface ShowingTextProps {
  total: number;
  page: number;
  itemsPerPage: number;
  subject: {
    singular: string;
    plural: string;
  } | string;
}

function ShowingText(props: ShowingTextProps) {
  const { total, page, itemsPerPage: limit } = props;
  
  if (total > limit) {
    const offset = (page - 1) * limit;
    const start = offset + 1;
    const end = Math.min(offset + limit, total);
    const subject = typeof props.subject === 'string' ? props.subject : props.subject.plural;
    return `Showing ${start} - ${end} of ${total} ${subject}`;
  } else {
    const subject = typeof props.subject === 'string' ? props.subject
      : total === 1 ? props.subject.singular
      : props.subject.plural;
    return `Total ${total} ${subject}`;
  }
}

export default ShowingText;