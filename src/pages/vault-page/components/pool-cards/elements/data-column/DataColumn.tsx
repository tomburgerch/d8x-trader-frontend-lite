import styles from './DataColumn.module.scss';

interface DataColumnPropsI {
  title: string;
  titleLink?: string;
  items: string[];
}

export const DataColumn = ({ title, titleLink, items }: DataColumnPropsI) => {
  return (
    <div className={styles.root}>
      {titleLink ? (
        <a href={titleLink} target="_blank" rel="noopener noreferrer" title={title} className={styles.titleLink}>
          {title}
        </a>
      ) : (
        <div className={styles.title}>{title}</div>
      )}
      {items.map((item) => (
        <div key={item} className={styles.itemLine}>
          {item}
        </div>
      ))}
    </div>
  );
};
