import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import styles from './info.module.scss';

interface InfoProps {
  first_publication_date: string;
  author: string;
  readingTime?: string;
}
export const Info = ({
  author,
  first_publication_date,
  readingTime,
}: InfoProps): JSX.Element => {
  return (
    <ul className={styles.container}>
      <li>
        <time>
          <FiCalendar />
          {first_publication_date}
        </time>
      </li>
      <li>
        <time>
          <FiUser />
          {author}
        </time>
      </li>
      {readingTime && (
        <li>
          <time>
            <FiClock />
            {readingTime}
          </time>
        </li>
      )}
    </ul>
  );
};
